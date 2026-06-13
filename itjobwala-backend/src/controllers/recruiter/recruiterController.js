import { Readable } from 'stream';
import bcrypt from 'bcrypt';
import dns from 'dns';
import Recruiter from '../../models/recruiter/Recruiter.js';
import cloudinary from '../../utils/cloudinary.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from '../../utils/tokenService.js';
import { createAndSendOtp } from '../../services/otp/otp.service.js';
import { bufferStream, validateUpload, IMAGE_TYPES, UploadError } from '../../utils/upload/validateUpload.js';
import { sanitizeText } from '../../utils/sanitize.js';

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const cloudStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      if (!result) return reject(new Error('Cloudinary returned no result'));
      resolve(result);
    });
    cloudStream.on('error', reject);
    Readable.from(buffer).pipe(cloudStream);
  });
}

const resolveMx = dns.promises.resolveMx;

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function setRefreshCookie(reply, token) {
  reply.setCookie('refresh_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   REFRESH_COOKIE_MAX_AGE,
  });
}

export const recruiterSignup = async (request, reply) => {
  const { full_name, company_name, email, password, terms_accepted } = request.body;

  try {
    if (email) {
      const domain = email.split('@')[1];
      try {
        const mxRecords = await resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
          return reply.status(400).send({ success: false, message: 'Invalid email domain. Please provide a valid email address.' });
        }
      } catch (err) {
        return reply.status(400).send({ success: false, message: 'Invalid email domain. Please provide a valid email address.' });
      }
    }
    const existingRecruiter = await Recruiter.query().findOne({ email });
    if (existingRecruiter) {
      return reply.status(409).send({ success: false, message: 'Email already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newRecruiter = await Recruiter.query().insert({
      full_name: sanitizeText(full_name),
      company_name: sanitizeText(company_name),
      email,
      password: hashedPassword,
      terms_accepted
    }).returning('*');

    const name = newRecruiter.full_name || newRecruiter.company_name;
    const { email_sent } = await createAndSendOtp({ email, role: 'recruiter', name })
      .catch((err) => {
        request.server.log.error(err, '[otp] Failed to send verification email after recruiter signup');
        return { email_sent: false };
      });

    return reply.status(201).send({
      success: true,
      message: 'Registration successful. Please verify your email to continue.',
      data: {
        requiresVerification: true,
        email,
        role: 'recruiter',
        email_sent,
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const recruiterSignin = async (request, reply) => {
  const { email, password } = request.body;
  try {
    const recruiter = await Recruiter.query().findOne({ email });
    if (!recruiter) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, recruiter.password);
    if (!isMatch) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    if (recruiter.is_active === false) {
      return reply.status(403).send({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        code:    'ACCOUNT_SUSPENDED',
      });
    }

    if (!recruiter.email_verified) {
      return reply.status(403).send({
        success: false,
        message: 'Please verify your email before signing in.',
        code:    'EMAIL_NOT_VERIFIED',
        data:    { email: recruiter.email, role: 'recruiter' },
      });
    }

    const accessToken  = generateAccessToken({ sub: recruiter.id, role: 'recruiter' });
    const refreshToken = generateRefreshToken({ sub: recruiter.id, role: 'recruiter' });

    await storeRefreshToken({
      userId:    recruiter.id,
      role:      'recruiter',
      token:     refreshToken,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    setRefreshCookie(reply, refreshToken);

    delete recruiter.password;

    return reply.status(200).send({
      success: true,
      message: 'Signin successful',
      token:   accessToken,
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getCompanyProfile = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const recruiter = await Recruiter.query().findById(recruiterId);

    if (!recruiter) {
      return reply.status(404).send({ success: false, message: 'Company profile not found', error: 'COMPANY_NOT_FOUND' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Company profile retrieved successfully',
      data: {
        id: `company_${recruiter.id}`,
        companyName: recruiter.company_name,
        fullName: recruiter.full_name,
        industry: recruiter.industry || 'Technology',
        website: recruiter.website,
        description: recruiter.about,
        logo: recruiter.logo,
        companySize: recruiter.size,
        location: recruiter.location,
        foundedYear: recruiter.founded ? parseInt(recruiter.founded, 10) : null,
        createdAt: recruiter.created_at,
        updatedAt: recruiter.updated_at
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateCompanyProfile = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const { 
      companyName, 
      industry, 
      website, 
      description, 
      companySize, 
      location, 
      foundedYear 
    } = request.body;

    const details = {};
    if (companyName != null && companyName !== '') {
      if (companyName.length < 2 || companyName.length > 100) {
        details.companyName = 'Company name must be between 2 and 100 characters';
      }
    }

    if (industry != null && industry !== '') {
      if (industry.length < 2 || industry.length > 50) {
        details.industry = 'Industry must be 2-50 characters';
      }
    }

    if (website != null && website !== '') {
      if (!/^https?:\/\/.+/.test(website)) {
        details.website = 'Invalid URL format. URL must start with http:// or https://';
      }
    }

    if (foundedYear != null) {
      const year = parseInt(foundedYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 2) {
        details.foundedYear = `Founded year must be between 1900 and ${currentYear + 2}`;
      }
    }

    if (Object.keys(details).length > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details
      });
    }

    // Check for duplicate company name if changing
    if (companyName) {
      const existing = await Recruiter.query()
        .where('company_name', companyName)
        .whereNot('id', recruiterId)
        .first();
      if (existing) {
        return reply.status(409).send({
          success: false,
          message: 'Company name already exists in the system',
          error: 'DUPLICATE_COMPANY_NAME'
        });
      }
    }

    const updateData = {};
    if (companyName !== undefined) updateData.company_name = sanitizeText(companyName);
    if (industry !== undefined) updateData.industry = sanitizeText(industry);
    if (website !== undefined) updateData.website = sanitizeText(website);
    if (description !== undefined) updateData.about = sanitizeText(description);
    if (companySize !== undefined) updateData.size = companySize;
    if (location !== undefined) updateData.location = sanitizeText(location);
    if (foundedYear != null) updateData.founded = String(foundedYear);

    const updated = await Recruiter.query().patchAndFetchById(recruiterId, updateData);

    return reply.status(200).send({
      success: true,
      message: 'Company profile updated successfully',
      data: {
        id: `company_${updated.id}`,
        companyName: updated.company_name,
        industry: updated.industry,
        website: updated.website,
        description: updated.about,
        logo: updated.logo,
        companySize: updated.size,
        location: updated.location,
        foundedYear: updated.founded ? parseInt(updated.founded, 10) : null,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const uploadCompanyLogo = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const data = await request.file();
    if (!data) return reply.status(400).send({ success: false, message: 'No file uploaded' });

    const buffer = await bufferStream(data.file, IMAGE_TYPES.maxBytes);
    await validateUpload(buffer, IMAGE_TYPES);

    const result = await uploadBuffer(buffer, {
      folder: `itjobwala/company_logos/rec_${recruiterId}`,
      resource_type: 'image',
      public_id: 'logo',
      overwrite: true,
    });

    await Recruiter.query().findById(recruiterId).patch({ logo: result.secure_url });

    return reply.status(200).send({ success: true, message: 'Company logo uploaded successfully.', data: { logo: result.secure_url } });
  } catch (error) {
    if (error instanceof UploadError) return reply.status(400).send({ success: false, message: error.message });
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
