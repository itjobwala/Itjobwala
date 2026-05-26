import Application from '../../models/jobs/Application.js';
import SavedJob from '../../models/jobs/SavedJob.js';
import User from '../../models/candidate/User.js';

export const getCandidateDashboard = async (request, reply) => {
  try {
    const userId = request.user.id;

    const [user, applications, savedCount] = await Promise.all([
      User.query().findById(userId).select(
        'full_name', 'profile_photo_url', 'profile_completion', 'title', 'location', 'open_to_work'
      ),
      Application.query()
        .where('user_id', userId)
        .withGraphFetched('job.recruiter')
        .orderBy('applied_at', 'desc'),
      SavedJob.query().where('user_id', userId).resultSize(),
    ]);

    if (!user) {
      return reply.status(404).send({ success: false, message: 'User not found' });
    }

    // Stats by status
    const statusCounts = { applied: 0, shortlisted: 0, interview: 0, offer: 0, rejected: 0, selected: 0, hired: 0 };
    for (const app of applications) {
      if (statusCounts[app.status] !== undefined) statusCounts[app.status]++;
    }

    // Recent 5 applications
    const recentApplications = applications.slice(0, 5).map(app => ({
      id:          `app_${app.id}`,
      status:      app.status,
      appliedAt:   app.applied_at,
      jobTitle:    app.job?.title ?? 'Unknown',
      company:     app.job?.recruiter?.company_name ?? 'Unknown',
      companyLogo: app.job?.recruiter?.logo ?? null,
      location:    app.job?.location ?? null,
      workMode:    app.job?.work_mode ?? null,
    }));

    return reply.status(200).send({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: {
        user: {
          fullName:          user.full_name,
          profilePhoto:      user.profile_photo_url,
          profileCompletion: user.profile_completion ?? 0,
          title:             user.title,
          location:          user.location,
          openToWork:        user.open_to_work,
        },
        stats: {
          totalApplications: applications.length,
          shortlisted:       statusCounts.shortlisted,
          interviews:        statusCounts.interview,
          offers:            statusCounts.offer + statusCounts.selected + statusCounts.hired,
          rejected:          statusCounts.rejected,
          savedJobs:         savedCount,
        },
        recentApplications,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
