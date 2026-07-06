import { Readable } from 'stream';
import User from '../../models/candidate/User.js';
import Experience from '../../models/candidate/Experience.js';
import Education from '../../models/candidate/Education.js';
import Certification from '../../models/candidate/Certification.js';
import cloudinary from '../../utils/cloudinary.js';
import { bufferStream, validateUpload, DOCUMENT_TYPES, IMAGE_TYPES, UploadError } from '../../utils/upload/validateUpload.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { syncProfileCompletion } from '../../utils/candidate/profileCompletion.js';

/** Build a patch/insert payload from only the given keys — blocks mass-assignment
 *  of columns like user_id/id via extra request.body properties. */
function pick(source, keys) {
  const result = {};
  for (const key of keys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
}

const EXPERIENCE_FIELDS   = ['company', 'role', 'employment_type', 'location', 'start_date', 'end_date', 'is_current', 'description', 'skills'];
const EDUCATION_FIELDS    = ['institution', 'degree', 'field_of_study', 'location', 'start_date', 'end_date', 'grade', 'is_current'];
const CERTIFICATION_FIELDS = ['name', 'issuer', 'issue_date', 'expiry_date', 'credential_id', 'credential_url'];

/** Upload a pre-validated Buffer to Cloudinary and return the result. */
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

function formatProfile(user) {
  const career_profile = typeof user.career_profile === 'string' ? JSON.parse(user.career_profile) : (user.career_profile || {});
  const personal_details = typeof user.personal_details === 'string' ? JSON.parse(user.personal_details) : (user.personal_details || {});
  
  return {
    id: `cand_${user.id}`,
    name: user.full_name,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.mobile,
    location: user.location,
    title: user.title,
    expected_salary: user.expected_salary != null ? parseFloat(user.expected_salary) : null,
    current_salary: user.current_salary != null ? parseFloat(user.current_salary) : null,
    career_profile: career_profile,
    personal_details: personal_details,
    linked_in: user.linked_in,
    github: user.github,
    about: user.about,
    bio: user.about, // Alias as requested
    open_to_work: user.open_to_work,
    profile_completion: user.profile_completion,
    profile_photo_url: user.profile_photo_url,
    profile_cover_url: user.profile_cover_url,
    resume_url: user.resume_url,
    availability_to_join: user.availability_to_join,
    work_status: user.work_status,
    experience_years: user.experience_years,
    skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || []),
    experience: (user.experience || []).map(exp => ({
      id: `exp_${exp.id}`,
      company: exp.company,
      role: exp.role,
      employment_type: exp.employment_type,
      location: exp.location,
      start_date: exp.start_date,
      end_date: exp.end_date,
      is_current: exp.is_current,
      description: exp.description,
      skills: typeof exp.skills === 'string' ? JSON.parse(exp.skills) : (exp.skills || [])
    })),
    education: (user.education || []).map(edu => ({
      id: `edu_${edu.id}`,
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.field_of_study,
      location: edu.location,
      start_date: edu.start_date,
      end_date: edu.end_date,
      grade: edu.grade,
      is_current: edu.is_current
    })),
    certifications: (user.certifications || []).map(cert => ({
      id: `cert_${cert.id}`,
      name: cert.name,
      issuer: cert.issuer,
      issue_date: cert.issue_date,
      certificate: cert.certificate_file_url ? {
        file_name: cert.certificate_file_name,
        file_url: cert.certificate_file_url,
        uploaded_at: cert.certificate_uploaded_at
      } : null
    })),
    resume: user.resume_url ? {
      file_name: user.resume_file_name,
      url: user.resume_url,
      uploaded_at: user.resume_uploaded_at
    } : null,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

export const getMyProfile = async (request, reply) => {
  try {
    const userId = request.user.id;
    const user = await User.query()
      .findById(userId)
      .withGraphFetched('[experience, education, certifications]');
      
    if (!user) {
      return reply.status(404).send({ success: false, message: 'Profile not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Profile fetched successfully.',
      data: formatProfile(user)
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateProfile = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { 
      name, first_name, last_name, phone, location, linked_in, github, about, open_to_work,
      title, expected_salary, current_salary, career_profile, personal_details,
      experience_years, work_status, resume_name, availability_to_join
    } = request.body;

    const updateData = {};
    
    if (first_name) updateData.first_name = sanitizeText(first_name);
    if (last_name) updateData.last_name = sanitizeText(last_name);
    
    // Reconstruct full_name if first/last name changed
    if (first_name || last_name) {
      const user = await User.query().findById(userId).select('first_name', 'last_name', 'full_name');
      const fName = sanitizeText(first_name) || user.first_name || '';
      const lName = sanitizeText(last_name) || user.last_name || '';
      updateData.full_name = `${fName} ${lName}`.trim();
    } else if (name) {
      updateData.full_name = sanitizeText(name);
    }

    if (phone) updateData.mobile = phone;
    if (location) updateData.location = sanitizeText(location);
    if (linked_in) updateData.linked_in = sanitizeText(linked_in);
    if (github) updateData.github = sanitizeText(github);
    if (about) updateData.about = sanitizeText(about);
    if (open_to_work !== undefined) updateData.open_to_work = open_to_work;
    if (resume_name) updateData.resume_file_name = sanitizeText(resume_name);
    
    if (title !== undefined) updateData.title = sanitizeText(title);
    if (expected_salary !== undefined) {
      updateData.expected_salary = (expected_salary === null || expected_salary === '') ? null : String(expected_salary);
    }
    if (current_salary !== undefined) {
      updateData.current_salary = (current_salary === null || current_salary === '') ? null : String(current_salary);
    }
    if (experience_years !== undefined) {
      if (experience_years === null || experience_years === '') {
        updateData.experience_years = null;
      } else {
        const parsed = parseInt(experience_years, 10);
        if (!isNaN(parsed)) updateData.experience_years = parsed;
      }
    }
    if (work_status) updateData.work_status = work_status;
    if (availability_to_join !== undefined) {
      if (!availability_to_join) {
        updateData.availability_to_join = null;
      } else if (availability_to_join.includes('T')) {
        updateData.availability_to_join = availability_to_join.split('T')[0];
      } else {
        updateData.availability_to_join = availability_to_join;
      }
    }
    
    // Handle partial updates for JSONB fields
    const existingUser = await User.query().findById(userId).select('career_profile', 'personal_details');
    
    if (career_profile) {
      const careerObj = typeof career_profile === 'string' ? JSON.parse(career_profile) : career_profile;
      const existingCareer = typeof existingUser.career_profile === 'string'
        ? JSON.parse(existingUser.career_profile)
        : (existingUser.career_profile || {});
      updateData.career_profile = { ...existingCareer, ...careerObj };
    }

    if (personal_details) {
      const personalObj = typeof personal_details === 'string' ? JSON.parse(personal_details) : personal_details;
      const existingPersonal = typeof existingUser.personal_details === 'string'
        ? JSON.parse(existingUser.personal_details)
        : (existingUser.personal_details || {});
      updateData.personal_details = { ...existingPersonal, ...personalObj };
    }

    await User.query().findById(userId).patch(updateData);
    syncProfileCompletion(userId).catch(() => {});

    return reply.status(200).send({
      success: true,
      message: 'Profile updated successfully.',
      data: {}
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const uploadResume = async (request, reply) => {
  try {
    const userId = request.user.id;
    const data = await request.file();
    if (!data) return reply.status(400).send({ success: false, message: 'No file uploaded' });

    const buffer = await bufferStream(data.file, DOCUMENT_TYPES.maxBytes);
    await validateUpload(buffer, DOCUMENT_TYPES);

    const result = await uploadBuffer(buffer, {
      folder: `itjobwala/resumes/cand_${userId}`,
      resource_type: 'raw',
      public_id: 'current_resume',
      overwrite: true,
    });

    const file_name  = data.filename;
    const url        = result.secure_url;
    const uploaded_at = new Date().toISOString();

    await User.query().findById(userId).patch({ resume_file_name: file_name, resume_url: url, resume_uploaded_at: uploaded_at });
    syncProfileCompletion(userId).catch(() => {});

    return reply.status(200).send({ success: true, message: 'Resume uploaded successfully.', data: { file_name, url, uploaded_at } });
  } catch (error) {
    if (error instanceof UploadError) return reply.status(400).send({ success: false, message: error.message });
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateSkills = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { skills } = request.body;

    await User.query().findById(userId).patch({
      skills: JSON.stringify(skills)
    });
    syncProfileCompletion(userId).catch(() => {});

    return reply.status(200).send({
      success: true,
      message: 'Skills updated successfully',
      data: null
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const addExperience = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { start_date, end_date, is_current } = request.body;

    if (!is_current && end_date && end_date !== '' && new Date(end_date) < new Date(start_date)) {
      return reply.status(400).send({ success: false, message: 'End date must be after start date.' });
    }

    const expData = { ...pick(request.body, EXPERIENCE_FIELDS), user_id: userId };
    if (expData.end_date === '') expData.end_date = null;
    if (expData.company) expData.company = sanitizeText(expData.company);
    if (expData.role) expData.role = sanitizeText(expData.role);
    if (expData.description) expData.description = sanitizeText(expData.description);
    if (expData.location) expData.location = sanitizeText(expData.location);

    const exp = await Experience.query().insert(expData);
    syncProfileCompletion(userId).catch(() => {});

    return reply.status(201).send({
      success: true,
      message: 'Experience added successfully.',
      data: { id: `exp_${exp.id}` }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateExperience = async (request, reply) => {
  try {
    const userId = request.user.id;
    const expId = request.params.exp_id.replace('exp_', '');
    const { company, role, start_date, end_date, is_current } = request.body;

    // Strict Date Validation: must be after (not same day)
    if (!is_current && end_date && end_date !== '' && start_date) {
      if (new Date(end_date) <= new Date(start_date)) {
        return reply.status(400).send({ success: false, message: 'End date must be after start date.' });
      }
    }

    const exp = await Experience.query().findOne({ id: expId, user_id: userId });
    if (!exp) return reply.status(404).send({ success: false, message: 'Experience entry not found.' });

    const updateData = pick(request.body, EXPERIENCE_FIELDS);
    if (updateData.company) updateData.company = sanitizeText(updateData.company.trim());
    if (updateData.role) updateData.role = sanitizeText(updateData.role.trim());
    if (updateData.description) updateData.description = sanitizeText(updateData.description);
    if (updateData.location) updateData.location = sanitizeText(updateData.location);
    if (updateData.end_date === '' || is_current) updateData.end_date = null;

    await exp.$query().patch(updateData);

    return reply.status(200).send({
      success: true,
      message: 'Experience updated successfully.',
      data: { id: `exp_${expId}` }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const deleteExperience = async (request, reply) => {
  try {
    const userId = request.user.id;
    const rawExpId = request.params.exp_id;
    
    // Validate ID format
    if (typeof rawExpId !== 'string' && typeof rawExpId !== 'number') {
      return reply.status(400).send({ success: false, message: 'Invalid experience ID format.' });
    }

    const expId = String(rawExpId).replace('exp_', '');
    if (isNaN(expId)) {
      return reply.status(400).send({ success: false, message: 'Invalid experience ID format.' });
    }

    // Check existence and ownership
    const exp = await Experience.query().findById(expId);
    if (!exp) {
      return reply.status(404).send({ success: false, message: 'Experience not found.' });
    }

    if (exp.user_id !== userId) {
      return reply.status(403).send({ success: false, message: 'You are not authorized to delete this experience.' });
    }

    // Check if it's the only experience
    const totalCountRes = await Experience.query().where({ user_id: userId }).count();
    const totalCount = parseInt(totalCountRes[0].count);
    
    if (totalCount <= 1) {
      return reply.status(400).send({ success: false, message: 'Cannot delete if it\'s the only experience.' });
    }

    await Experience.query().deleteById(expId);

    return reply.status(200).send({
      success: true,
      message: 'Experience deleted successfully.',
      data: {}
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const addEducation = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { start_date, end_date, is_current } = request.body;

    if (!is_current && end_date && end_date !== '' && new Date(end_date) < new Date(start_date)) {
      return reply.status(400).send({ success: false, message: 'end_date must be after start_date.' });
    }

    if (is_current && end_date && end_date !== '') {
      return reply.status(400).send({ success: false, message: 'end_date must be null when is_current is true.' });
    }

    const eduData = { ...pick(request.body, EDUCATION_FIELDS), user_id: userId };
    if (eduData.end_date === '') eduData.end_date = null;
    if (eduData.institution) eduData.institution = sanitizeText(eduData.institution);
    if (eduData.degree) eduData.degree = sanitizeText(eduData.degree);
    if (eduData.field_of_study) eduData.field_of_study = sanitizeText(eduData.field_of_study);
    if (eduData.location) eduData.location = sanitizeText(eduData.location);
    if (eduData.grade) eduData.grade = sanitizeText(eduData.grade);

    const edu = await Education.query().insert(eduData);
    syncProfileCompletion(userId).catch(() => {});

    return reply.status(201).send({
      success: true,
      message: 'Education added successfully.',
      data: { 
        id: `edu_${edu.id}`,
        ...edu 
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateEducation = async (request, reply) => {
  try {
    const userId = request.user.id;
    const eduId = request.params.edu_id.replace('edu_ ', '').replace('edu_', '');
    const { start_date, end_date, is_current } = request.body;

    if (!is_current && end_date && end_date !== '' && start_date && new Date(end_date) < new Date(start_date)) {
      return reply.status(400).send({ success: false, message: 'end_date must be after start_date.' });
    }

    if (is_current && end_date && end_date !== '') {
      return reply.status(400).send({ success: false, message: 'end_date must be null when is_current is true.' });
    }

    const edu = await Education.query().findOne({ id: eduId, user_id: userId });
    if (!edu) return reply.status(404).send({ success: false, message: 'Education not found.' });

    const updateData = pick(request.body, EDUCATION_FIELDS);
    if (updateData.end_date === '' || is_current) updateData.end_date = null;
    if (updateData.institution) updateData.institution = sanitizeText(updateData.institution);
    if (updateData.degree) updateData.degree = sanitizeText(updateData.degree);
    if (updateData.field_of_study) updateData.field_of_study = sanitizeText(updateData.field_of_study);
    if (updateData.location) updateData.location = sanitizeText(updateData.location);
    if (updateData.grade) updateData.grade = sanitizeText(updateData.grade);

    const updatedEdu = await edu.$query().patchAndFetch(updateData);

    return reply.status(200).send({
      success: true,
      message: 'Education updated successfully.',
      data: { 
        id: `edu_${eduId}`,
        ...updatedEdu 
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const deleteEducation = async (request, reply) => {
  try {
    const userId = request.user.id;
    const rawEduId = request.params.edu_id;
    
    if (typeof rawEduId !== 'string' && typeof rawEduId !== 'number') {
      return reply.status(400).send({ success: false, message: 'Invalid education ID format.' });
    }

    const eduId = String(rawEduId).replace('edu_', '');
    if (isNaN(eduId)) {
      return reply.status(400).send({ success: false, message: 'Invalid education ID format.' });
    }

    const edu = await Education.query().findById(eduId);
    if (!edu) return reply.status(404).send({ success: false, message: 'Education not found.' });

    if (edu.user_id !== userId) {
      return reply.status(403).send({ success: false, message: 'You are not authorized to delete this education.' });
    }

    const countRes = await Education.query().where({ user_id: userId }).count();
    if (parseInt(countRes[0].count) <= 1) {
      return reply.status(400).send({ success: false, message: 'Cannot delete if it\'s the only education.' });
    }

    await Education.query().deleteById(eduId);

    return reply.status(200).send({
      success: true,
      message: 'Education deleted successfully.',
      data: {}
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const addCertification = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { name, issuer, issue_date } = request.body;

    if (new Date(issue_date) > new Date()) {
      return reply.status(400).send({ success: false, message: 'Issue date cannot be in the future.' });
    }

    const certData = {
      ...pick(request.body, CERTIFICATION_FIELDS),
      user_id: userId,
      name: sanitizeText(name.trim()),
      issuer: sanitizeText(issuer.trim())
    };

    const cert = await Certification.query().insert(certData);

    return reply.status(201).send({
      success: true,
      message: 'Certification added successfully.',
      data: { 
        id: `cert_${cert.id}`,
        ...cert
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateCertification = async (request, reply) => {
  try {
    const userId = request.user.id;
    const rawCertId = request.params.cert_id;
    
    if (typeof rawCertId !== 'string' && typeof rawCertId !== 'number') {
      return reply.status(400).send({ success: false, message: 'Invalid certification ID format.' });
    }

    const certId = String(rawCertId).replace('cert_', '');
    if (isNaN(certId)) {
      return reply.status(400).send({ success: false, message: 'Invalid certification ID format.' });
    }

    const { name, issuer, issue_date } = request.body;
    if (new Date(issue_date) > new Date()) {
      return reply.status(400).send({ success: false, message: 'Issue date cannot be in the future.' });
    }

    const cert = await Certification.query().findOne({ id: certId, user_id: userId });
    if (!cert) return reply.status(404).send({ success: false, message: 'Certification not found.' });

    const updateData = {
      ...pick(request.body, CERTIFICATION_FIELDS),
      name: sanitizeText(name.trim()),
      issuer: sanitizeText(issuer.trim())
    };

    const updatedCert = await cert.$query().patchAndFetch(updateData);

    return reply.status(200).send({
      success: true,
      message: 'Certification updated successfully.',
      data: { 
        id: `cert_${certId}`,
        ...updatedCert
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const deleteCertification = async (request, reply) => {
  try {
    const userId = request.user.id;
    const rawCertId = request.params.cert_id;
    
    if (typeof rawCertId !== 'string' && typeof rawCertId !== 'number') {
      return reply.status(400).send({ success: false, message: 'Invalid certification ID format.' });
    }

    const certId = String(rawCertId).replace('cert_', '');
    if (isNaN(certId)) {
      return reply.status(400).send({ success: false, message: 'Invalid certification ID format.' });
    }

    const cert = await Certification.query().findById(certId);
    if (!cert) return reply.status(404).send({ success: false, message: 'Certification not found.' });

    if (cert.user_id !== userId) {
      return reply.status(403).send({ success: false, message: 'You are not authorized to delete this certification.' });
    }

    await Certification.query().deleteById(certId);

    return reply.status(200).send({
      success: true,
      message: 'Certification deleted successfully.',
      data: {}
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const uploadProfilePhoto = async (request, reply) => {
  try {
    const userId = request.user.id;
    const data = await request.file();
    if (!data) return reply.status(400).send({ success: false, message: 'No file uploaded' });

    const buffer = await bufferStream(data.file, IMAGE_TYPES.maxBytes);
    await validateUpload(buffer, IMAGE_TYPES);

    const result = await uploadBuffer(buffer, {
      folder: `itjobwala/profile_photos/cand_${userId}`,
      resource_type: 'image',
      public_id: 'profile_photo',
      overwrite: true,
    });

    await User.query().findById(userId).patch({ profile_photo_url: result.secure_url });
    syncProfileCompletion(userId).catch(() => {});

    return reply.status(200).send({ success: true, message: 'Profile photo uploaded successfully.', data: { url: result.secure_url } });
  } catch (error) {
    if (error instanceof UploadError) return reply.status(400).send({ success: false, message: error.message });
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const uploadCertificate = async (request, reply) => {
  try {
    const userId = request.user.id;
    const certId = request.params.cert_id.replace('cert_', '');
    const data = await request.file();
    if (!data) return reply.status(400).send({ success: false, message: 'No file uploaded' });

    const cert = await Certification.query().findOne({ id: certId, user_id: userId });
    if (!cert) return reply.status(404).send({ success: false, message: 'Certification not found.' });

    const buffer = await bufferStream(data.file, DOCUMENT_TYPES.maxBytes);
    await validateUpload(buffer, DOCUMENT_TYPES);

    const result = await uploadBuffer(buffer, {
      folder: `itjobwala/certificates/cand_${userId}`,
      resource_type: 'raw',
      public_id: `certificate_${certId}`,
      overwrite: true,
    });

    const file_name   = data.filename;
    const url         = result.secure_url;
    const uploaded_at = new Date().toISOString();

    await cert.$query().patch({ certificate_file_name: file_name, certificate_file_url: url, certificate_uploaded_at: uploaded_at });

    return reply.status(200).send({ success: true, message: 'Certificate uploaded successfully.', data: { file_name, url, uploaded_at } });
  } catch (error) {
    if (error instanceof UploadError) return reply.status(400).send({ success: false, message: error.message });
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const uploadProfileCover = async (request, reply) => {
  try {
    const userId = request.user.id;
    const data = await request.file();
    if (!data) return reply.status(400).send({ success: false, message: 'No file uploaded' });

    const buffer = await bufferStream(data.file, IMAGE_TYPES.maxBytes);
    await validateUpload(buffer, IMAGE_TYPES);

    const result = await uploadBuffer(buffer, {
      folder: `itjobwala/profile_covers/cand_${userId}`,
      resource_type: 'image',
      public_id: 'profile_cover',
      overwrite: true,
    });

    await User.query().findById(userId).patch({ profile_cover_url: result.secure_url });

    return reply.status(200).send({ success: true, message: 'Profile cover uploaded successfully.', data: { url: result.secure_url } });
  } catch (error) {
    if (error instanceof UploadError) return reply.status(400).send({ success: false, message: error.message });
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getProfileCompletion = async (request, reply) => {
  try {
    const userId = request.user.id;

    // Recomputes AND persists users.profile_completion in one call, so this
    // frequently-hit endpoint doubles as a sync point for the column read by
    // recruiter search/drawer and admin views.
    const result = await syncProfileCompletion(userId);
    if (!result) {
      return reply.status(404).send({ success: false, message: 'User not found' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Profile completion fetched.',
      data: result,
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
