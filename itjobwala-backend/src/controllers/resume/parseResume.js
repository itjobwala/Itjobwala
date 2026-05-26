import ResumeInsight           from '../../models/candidate/ResumeInsight.js';
import User                    from '../../models/candidate/User.js';
import { parseResumeFromUrl }  from '../../services/resume/parser.service.js';
import { runATSAnalysis }      from '../../services/resume/ats.service.js';

/**
 * POST /resume/parse
 *
 * Parses the candidate's uploaded resume and stores ATS analysis results.
 * Uses the resume_url already on the user's profile.
 * Idempotent: re-parses and overwrites on each call.
 */
export const parseResume = async (request, reply) => {
  const candidateId = request.user.id;

  const user = await User.query()
    .findById(candidateId)
    .withGraphFetched('[experience, certifications]')
    .select('id', 'full_name', 'about', 'experience_years', 'career_profile');

  if (!user) {
    return reply.status(404).send({ success: false, message: 'User not found.' });
  }

  // Determine resume URL: accept override in body or use profile URL
  const resumeUrl = request.body?.resume_url
    || (await User.query().findById(candidateId).select('career_profile'))
      ?.career_profile?.resume_url
    || null;

  if (!resumeUrl) {
    return reply.status(400).send({
      success: false,
      message: 'No resume found on your profile. Please upload a resume first.',
    });
  }

  // ── Parse ──────────────────────────────────────────────────────────────────
  let parsed;
  try {
    parsed = await parseResumeFromUrl(resumeUrl);
  } catch (err) {
    request.log.error({ err }, 'Resume text extraction failed');
    return reply.status(422).send({
      success: false,
      message: 'Could not extract text from your resume. Please ensure it is a valid PDF or DOCX file.',
    });
  }

  // ── Profile skills from career_profile.skills (array) ─────────────────────
  const profileSkills = user.career_profile?.skills ?? [];

  // ── ATS analysis ──────────────────────────────────────────────────────────
  const ats = runATSAnalysis(parsed, profileSkills);

  // ── Persist ────────────────────────────────────────────────────────────────
  const now     = new Date().toISOString();
  const payload = {
    candidate_id:             candidateId,
    resume_url:               resumeUrl,
    parsed_text:              parsed.parsedText,
    ats_score:                ats.ats_score,
    profile_completion_score: computeProfileCompletion(user, parsed),
    score_breakdown:          ats.score_breakdown,
    extracted_skills:         parsed.extractedSkills,
    missing_skills:           ats.missing_skills,
    suggested_keywords:       ats.suggested_keywords,
    strengths:                ats.strengths,
    weaknesses:               ats.weaknesses,
    suggestions:              ats.suggestions,
    contact_info:             parsed.contactInfo,
    experience_entries:       parsed.experienceEntries,
    education_entries:        parsed.educationEntries,
    project_entries:          parsed.projectEntries,
    certification_entries:    parsed.certificationEntries,
    experience_years:         parsed.experienceYears,
    total_skills_found:       parsed.extractedSkills.length,
    word_count:               parsed.wordCount,
    parse_version:            '1.0',
    last_parsed_at:           now,
    updated_at:               now,
  };

  // Upsert using the UNIQUE constraint on candidate_id
  const existing = await ResumeInsight.query().findOne({ candidate_id: candidateId });
  let insight;
  if (existing) {
    insight = await existing.$query().patchAndFetch(payload);
  } else {
    insight = await ResumeInsight.query().insertAndFetch(payload);
  }

  return reply.send({
    success: true,
    message: 'Resume parsed successfully.',
    data: formatInsightResponse(insight, ats),
  });
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeProfileCompletion(user, parsed) {
  let score = 0;
  if (user.full_name)                         score += 15;
  if (user.about)                             score += 10;
  if (parsed.contactInfo.email)               score += 10;
  if (parsed.contactInfo.phone)               score += 10;
  if (parsed.contactInfo.linkedin)            score += 5;
  if ((user.career_profile?.skills ?? []).length > 0) score += 15;
  if (parsed.experienceEntries.length > 0)    score += 15;
  if (parsed.educationEntries.length > 0)     score += 10;
  if (parsed.projectEntries.length > 0)       score += 5;
  if (parsed.certificationEntries.length > 0) score += 5;
  return Math.min(score, 100);
}

function formatInsightResponse(insight, ats) {
  return {
    id:                       insight.id,
    ats_score:                insight.ats_score,
    profile_completion_score: insight.profile_completion_score,
    band_label:               ats.band_label,
    band_color:               ats.band_color,
    score_breakdown:          insight.score_breakdown,
    extracted_skills:         insight.extracted_skills,
    missing_skills:           insight.missing_skills,
    suggested_keywords:       insight.suggested_keywords,
    strengths:                insight.strengths,
    weaknesses:               insight.weaknesses,
    suggestions:              insight.suggestions,
    contact_info:             insight.contact_info,
    experience_entries:       insight.experience_entries,
    education_entries:        insight.education_entries,
    project_entries:          insight.project_entries,
    certification_entries:    insight.certification_entries,
    experience_years:         insight.experience_years,
    total_skills_found:       insight.total_skills_found,
    word_count:               insight.word_count,
    last_parsed_at:           insight.last_parsed_at,
  };
}
