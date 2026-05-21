import Job from '../../models/jobs/Job.js';
import Recruiter from '../../models/recruiter/Recruiter.js';
import User from '../../models/candidate/User.js';

export const getHomeStats = async (request, reply) => {
  try {
    const total_jobs = await Job.query().where('status', 'active').resultSize();
    const total_companies = await Recruiter.query().resultSize();
    const total_candidates = await User.query().resultSize();

    // Calculate jobs added today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const jobs_added_today = await Job.query()
      .where('status', 'active')
      .where('created_at', '>=', startOfDay.toISOString())
      .resultSize();

    return reply.status(200).send({
      success: true,
      message: 'Platform statistics fetched.',
      data: {
        total_jobs,
        total_companies,
        total_candidates,
        jobs_added_today
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const uploadImage = async (request, reply) => {
  try {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ success: false, message: 'No file uploaded' });
    }

    // Mocking an S3/Cloudinary URL return
    const file_name = data.filename;
    const url = `https://cdn.itjobwala.com/images/${Date.now()}_${file_name}`;

    return reply.status(200).send({
      success: true,
      message: 'Image uploaded successfully.',
      data: { url }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const uploadDocument = async (request, reply) => {
  try {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ success: false, message: 'No file uploaded' });
    }

    // Mocking an S3 URL return
    const file_name = data.filename;
    const url = `https://cdn.itjobwala.com/documents/${Date.now()}_${file_name}`;

    return reply.status(200).send({
      success: true,
      message: 'Document uploaded successfully.',
      data: { url }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
