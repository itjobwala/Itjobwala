import Resume from '../../models/candidate/Resume.js';
import User from '../../models/candidate/User.js';
import ResumeInsight from '../../models/candidate/ResumeInsight.js';
import { deepSanitize } from '../../utils/sanitize.js';

export const listResumes = async (request, reply) => {
  try {
    const userId = request.user.id;
    const resumes = await Resume.query()
      .where('candidate_id', userId)
      .select('id', 'title', 'template', 'created_at', 'updated_at')
      .orderBy('updated_at', 'desc');
    return reply.status(200).send({ success: true, message: 'Resumes fetched.', data: { resumes } });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const createResume = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { title = 'Untitled Resume', template = 'modern', content = {} } = request.body ?? {};
    const resume = await Resume.query().insertAndFetch({
      candidate_id: userId,
      title,
      template,
      content: deepSanitize(content),
    });
    return reply.status(201).send({ success: true, message: 'Resume created.', data: { resume } });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getResume = async (request, reply) => {
  try {
    const userId = request.user.id;
    const resumeId = parseInt(request.params.id, 10);
    const resume = await Resume.query().findOne({ id: resumeId, candidate_id: userId });
    if (!resume) {
      return reply.status(404).send({ success: false, message: 'Resume not found.' });
    }
    return reply.status(200).send({ success: true, message: 'Resume fetched.', data: { resume } });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateResume = async (request, reply) => {
  try {
    const userId = request.user.id;
    const resumeId = parseInt(request.params.id, 10);
    const resume = await Resume.query().findOne({ id: resumeId, candidate_id: userId });
    if (!resume) {
      return reply.status(404).send({ success: false, message: 'Resume not found.' });
    }
    const { title, template, content } = request.body ?? {};
    const updates = { updated_at: new Date().toISOString() };
    if (title     !== undefined) updates.title    = title;
    if (template  !== undefined) updates.template = template;
    if (content   !== undefined) updates.content  = deepSanitize(content);
    const updated = await resume.$query().patchAndFetch(updates);
    return reply.status(200).send({ success: true, message: 'Resume updated.', data: { resume: updated } });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const deleteResume = async (request, reply) => {
  try {
    const userId = request.user.id;
    const resumeId = parseInt(request.params.id, 10);
    const resume = await Resume.query().findOne({ id: resumeId, candidate_id: userId });
    if (!resume) {
      return reply.status(404).send({ success: false, message: 'Resume not found.' });
    }
    await Resume.query().deleteById(resumeId);
    return reply.status(200).send({ success: true, message: 'Resume deleted.', data: {} });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getPrefill = async (request, reply) => {
  try {
    const userId = request.user.id;

    const [user, insight] = await Promise.all([
      User.query()
        .findById(userId)
        .withGraphFetched('[experience, education, certifications]'),
      ResumeInsight.query()
        .findOne({ candidate_id: userId })
        .select('project_entries', 'extracted_skills'),
    ]);

    if (!user) {
      return reply.status(404).send({ success: false, message: 'Profile not found.' });
    }

    const userSkills = Array.isArray(user.skills)
      ? user.skills
      : (typeof user.skills === 'string' ? JSON.parse(user.skills) : []);
    const insightSkills = insight?.extracted_skills ?? [];

    const content = {
      contact: {
        full_name: user.full_name  || '',
        title:     user.title      || '',
        email:     user.email      || '',
        phone:     user.mobile     || '',
        location:  user.location   || '',
        linkedin:  user.linked_in  || '',
        github:    user.github     || '',
        website:   '',
      },
      summary: user.about || '',
      experiences: (user.experience || []).map((exp, i) => ({
        id:         `exp_${i}`,
        company:    exp.company    || '',
        role:       exp.role       || '',
        location:   exp.location   || '',
        start_date: exp.start_date || '',
        end_date:   exp.end_date   || '',
        is_current: exp.is_current || false,
        bullets:    exp.description ? [exp.description] : [],
      })),
      education: (user.education || []).map((edu, i) => ({
        id:          `edu_${i}`,
        institution: edu.institution    || '',
        degree:      edu.degree         || '',
        field:       edu.field_of_study || '',
        start_year:  edu.start_date ? String(new Date(edu.start_date).getFullYear()) : '',
        end_year:    edu.end_date   ? String(new Date(edu.end_date).getFullYear())   :
                     edu.is_current ? 'Present' : '',
        grade:       edu.grade || '',
      })),
      skills: userSkills.length > 0 ? userSkills : insightSkills,
      projects: (insight?.project_entries || []).map((proj, i) => ({
        id:          `proj_${i}`,
        name:        proj.name        || '',
        description: proj.description || '',
        link:        '',
        bullets:     [],
      })),
      certifications: (user.certifications || []).map((cert, i) => ({
        id:             `cert_${i}`,
        name:           cert.name       || '',
        issuer:         cert.issuer     || '',
        issue_date:     cert.issue_date || '',
        credential_url: '',
      })),
      section_order: ['summary', 'experiences', 'education', 'skills', 'projects', 'certifications'],
    };

    return reply.status(200).send({ success: true, message: 'Pre-fill data assembled.', data: { content } });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
