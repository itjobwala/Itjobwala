import RecruiterVisibility from '../models/RecruiterVisibility.js';
import User from '../models/User.js';

export const getRecruiterVisibility = async (request, reply) => {
  try {
    const userId = request.user.id;

    let visibility = await RecruiterVisibility.query().findOne({ user_id: userId });

    if (!visibility) {
      // Create default if not exists
      visibility = await RecruiterVisibility.query().insert({
        user_id: userId,
        recruiter_visible: true,
        open_to_job_types: ['full-time']
      });
    }

    const user = await User.query().findById(userId).select('updated_at');

    // MOCK STATS for now as tables don't exist yet
    // In production, these would be queries to profile_views and messages tables
    const stats = {
      profile_views: Math.floor(Math.random() * 50) + 10,
      recruiter_messages: Math.floor(Math.random() * 10) + 2,
      last_active: user.updated_at ? user.updated_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return reply.status(200).send({
      success: true,
      message: 'Visibility settings fetched successfully.',
      data: {
        recruiter_visible: visibility.recruiter_visible,
        open_to_job_types: visibility.open_to_job_types || [],
        ...stats
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateRecruiterVisibility = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { recruiter_visible, open_to_job_types } = request.body;

    // Validation
    if (typeof recruiter_visible !== 'boolean') {
      return reply.status(400).send({ success: false, message: 'recruiter_visible must be a boolean.' });
    }

    if (!Array.isArray(open_to_job_types)) {
      return reply.status(400).send({ success: false, message: 'open_to_job_types must be an array.' });
    }

    if (recruiter_visible && open_to_job_types.length === 0) {
      return reply.status(400).send({ success: false, message: 'Please provide at least one job type when visible.' });
    }

    let visibility = await RecruiterVisibility.query().findOne({ user_id: userId });

    if (!visibility) {
      visibility = await RecruiterVisibility.query().insert({
        user_id: userId,
        recruiter_visible,
        open_to_job_types
      });
    } else {
      visibility = await visibility.$query().patchAndFetch({
        recruiter_visible,
        open_to_job_types
      });
    }

    const user = await User.query().findById(userId).select('updated_at');

    const stats = {
      profile_views: 24, // Consistent mock for testing
      recruiter_messages: 6,
      last_active: user.updated_at ? user.updated_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return reply.status(200).send({
      success: true,
      message: 'Visibility settings updated successfully.',
      data: {
        recruiter_visible: visibility.recruiter_visible,
        open_to_job_types: visibility.open_to_job_types || [],
        ...stats
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
