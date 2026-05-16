import bcrypt from 'bcrypt';
import dns from 'dns';
import Recruiter from '../models/Recruiter.js';

const resolveMx = dns.promises.resolveMx;

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
      full_name,
      company_name,
      email,
      password: hashedPassword,
      terms_accepted
    }).returning('*');

    delete newRecruiter.password;

    return reply.status(201).send({
      success: true,
      message: 'Recruiter registered successfully'
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const recruiterSignin = async (request, reply) => {
  const { email, password } = request.body;
  console.log("email", email);
  console.log("password", password);
  try {
    if (email) {
      const domain = email.split('@')[1];
      try {
        const mxRecords = await resolveMx(domain);
        console.log("mxRecords", mxRecords);
        if (!mxRecords || mxRecords.length === 0) {
          return reply.status(400).send({ success: false, message: 'Invalid email domain. Please provide a valid email address.' });
        }
      } catch (err) {
        console.log("err", err);
        return reply.status(400).send({ success: false, message: 'Invalid email domain. Please provide a valid email address.' });
      }
    }

    const recruiter = await Recruiter.query().findOne({ email });
    if (!recruiter) {
      return reply.status(404).send({ success: false, message: 'Recruiter not found' });
    }

    const isMatch = await bcrypt.compare(password, recruiter.password);
    if (!isMatch) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token with a role flag to distinguish recruiters from users
    const token = request.server.jwt.sign({
      id: recruiter.id,
      email: recruiter.email,
      role: 'recruiter'
    });

    // Do not return password in response
    delete recruiter.password;

    return reply.status(200).send({
      success: true,
      message: 'Signin successful',
      token
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
    if (companyName !== undefined) {
      if (companyName.length < 2 || companyName.length > 100) {
        details.companyName = 'Company name must be between 2 and 100 characters';
      }
    }

    if (industry !== undefined) {
      if (industry.length < 2 || industry.length > 50) {
        details.industry = 'Industry is required and must be 2-50 characters';
      }
    }

    if (website && !/^https?:\/\/.+/.test(website)) {
      details.website = 'Invalid URL format. URL must start with http:// or https://';
    }

    if (foundedYear !== undefined) {
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
    if (companyName !== undefined) updateData.company_name = companyName;
    if (industry !== undefined) updateData.industry = industry;
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.about = description;
    if (companySize !== undefined) updateData.size = companySize;
    if (location !== undefined) updateData.location = location;
    if (foundedYear !== undefined) updateData.founded = String(foundedYear);

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
