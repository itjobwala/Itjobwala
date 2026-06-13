import RecruiterVisibility from '../../models/recruiter/RecruiterVisibility.js';
import User from '../../models/candidate/User.js';
import Conversation from '../../models/chat/Conversation.js';
import ProfileView from '../../models/recruiter/ProfileView.js';

export const getRecruiterVisibility = async (request, reply) => {
  try {
    const userId = request.user.id;

    let visibility = await RecruiterVisibility.query().findOne({ user_id: userId });

    if (!visibility) {
      visibility = await RecruiterVisibility.query().insert({
        user_id: userId,
        recruiter_visible: true,
        open_to_job_types: ['full-time']
      });
    }

    const [user, profileViews, recruiterMessages] = await Promise.all([
      User.query().findById(userId).select('updated_at'),
      ProfileView.query().where('candidate_user_id', userId).resultSize(),
      Conversation.query().where('candidate_id', userId).resultSize(),
    ]);

    return reply.status(200).send({
      success: true,
      message: 'Visibility settings fetched successfully.',
      data: {
        recruiter_visible:  visibility.recruiter_visible,
        open_to_job_types:  visibility.open_to_job_types || [],
        profile_views:      profileViews,
        recruiter_messages: recruiterMessages,
        last_active: user?.updated_at
          ? new Date(user.updated_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
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

    const [user, profileViews, recruiterMessages] = await Promise.all([
      User.query().findById(userId).select('updated_at'),
      ProfileView.query().where('candidate_user_id', userId).resultSize(),
      Conversation.query().where('candidate_id', userId).resultSize(),
    ]);

    return reply.status(200).send({
      success: true,
      message: 'Visibility settings updated successfully.',
      data: {
        recruiter_visible:  visibility.recruiter_visible,
        open_to_job_types:  visibility.open_to_job_types || [],
        profile_views:      profileViews,
        recruiter_messages: recruiterMessages,
        last_active: user?.updated_at
          ? new Date(user.updated_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
