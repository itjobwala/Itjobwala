/**
 * Applies job search/alert criteria to a Job Objection query builder.
 * Mutates and returns the query so callers can chain .page(), .limit(), etc.
 *
 * This mirrors the filter logic in jobController.getJobs so that the alert
 * matcher and the public job list always behave identically.
 */
export function applyJobFilters(query, {
  q,
  location,
  job_type,
  work_mode,
  salary_min,
  experience,
  skills,
} = {}) {
  if (q)        query.where('title', 'ILIKE', `%${q}%`);
  if (location) query.where('location', 'ILIKE', `%${location}%`);

  if (job_type) {
    const types = Array.isArray(job_type)
      ? job_type
      : job_type.split(',').map(s => s.trim()).filter(Boolean);
    if (types.length) query.whereIn('job_type', types);
  }

  if (work_mode) {
    const modes = Array.isArray(work_mode)
      ? work_mode
      : work_mode.split(',').map(s => s.trim()).filter(Boolean);
    if (modes.length) query.whereIn('work_mode', modes);
  }

  if (salary_min) query.where('salary_min', '>=', parseInt(salary_min, 10));

  if (experience != null) {
    const exp = parseInt(experience, 10);
    query.where('experience_min', '<=', exp).andWhere('experience_max', '>=', exp);
  }

  if (skills) {
    const list = Array.isArray(skills)
      ? skills
      : skills.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length) {
      query.where(builder => {
        list.forEach(skill => {
          builder.orWhereRaw('CAST(skills AS TEXT) ILIKE ?', [`%${skill}%`]);
        });
      });
    }
  }

  return query;
}

/**
 * Pure in-memory version of the same criteria logic.
 * Used for unit testing the alert matcher's criteria evaluation without hitting the DB.
 */
export function matchesAlertCriteria(job, criteria = {}) {
  const { keywords, location, work_mode, job_type, salary_min, experience } = criteria;

  if (keywords) {
    if (!job.title?.toLowerCase().includes(keywords.toLowerCase())) return false;
  }

  if (location) {
    if (!job.location?.toLowerCase().includes(location.toLowerCase())) return false;
  }

  if (work_mode?.length) {
    if (!work_mode.includes(job.work_mode)) return false;
  }

  if (job_type?.length) {
    if (!job_type.includes(job.job_type)) return false;
  }

  if (salary_min != null) {
    if (job.salary_min == null || job.salary_min < salary_min) return false;
  }

  if (experience != null) {
    const exp = parseInt(experience, 10);
    if (job.experience_min > exp || job.experience_max < exp) return false;
  }

  return true;
}
