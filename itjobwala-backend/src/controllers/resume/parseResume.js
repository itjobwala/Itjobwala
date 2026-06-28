import ResumeInsight              from '../../models/candidate/ResumeInsight.js';
import User                       from '../../models/candidate/User.js';
import { parseResumeFromUrl }     from '../../services/resume/parser.service.js';
import { runATSAnalysis }         from '../../services/resume/ats.service.js';
import { saveVersionSnapshot }    from '../../services/resume/versionHistory.service.js';

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

  // Determine resume URL: accept override in body or fall back to the
  // resume_url column that uploadResume stores on the user row.
  const resumeUrl = request.body?.resume_url
    || (await User.query().findById(candidateId).select('resume_url'))
      ?.resume_url
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
  const ats = await runATSAnalysis(parsed, profileSkills);

  // ── Eligibility gate — invalid document or non-QA resume ────────────────────
  if (ats.eligible === false) {
    const message = ats.reason === 'invalid_document'
      ? 'The uploaded file does not appear to be a resume. Please upload a valid resume.'
      : 'Resume does not appear to belong to a QA professional.';

    const now = new Date().toISOString();
    const ineligiblePayload = {
      eligible:              false,
      reason:                ats.reason,
      detected_domain:       ats.detected_domain,
      domain_confidence:     ats.domain_confidence,
      domain_label:          ats.domain_label,
      ats_score:             0,
      profile_completion_score: 0,
      parsed_text:           parsed.parsedText,
      contact_info:          parsed.contactInfo,
      candidate_location:    parsed.contactInfo?.location ?? null,
      extracted_skills:      parsed.extractedSkills       ?? [],
      skill_metadata:        parsed.skillMetadata         ?? [],
      experience_entries:    parsed.experienceEntries     ?? [],
      education_entries:     parsed.educationEntries      ?? [],
      certification_entries: parsed.certificationEntries  ?? [],
      achievement_entries:   parsed.achievementEntries    ?? [],
      experience_years:      parsed.experienceYears       ?? 0,
      total_skills_found:    (parsed.extractedSkills ?? []).length,
      word_count:            parsed.wordCount             ?? 0,
      parse_version:         '1.0',
      last_parsed_at:        now,
      updated_at:            now,
    };

    // Always upsert regardless of reason so GET /resume/insights always reflects
    // the latest parse. Different uploads have different URLs, so keying on
    // (candidate_id, resume_url) ensures each uploaded file gets its own row.
    const existing = await ResumeInsight.query().findOne({ candidate_id: candidateId, resume_url: resumeUrl });
    if (existing) {
      await existing.$query().patchAndFetch(ineligiblePayload);
    } else {
      await ResumeInsight.query().insertAndFetch({ candidate_id: candidateId, resume_url: resumeUrl, ...ineligiblePayload });
    }

    return reply.status(422).send({
      success: false,
      message,
      data: {
        eligible:          false,
        reason:            ats.reason,
        detected_domain:   ats.detected_domain,
        domain_confidence: ats.domain_confidence,
        domain_label:      ats.domain_label,
        word_count:        ats.word_count ?? null,
      },
    });
  }

  // ── Persist ────────────────────────────────────────────────────────────────
  const now     = new Date().toISOString();
  const payload = {
    candidate_id:             candidateId,
    resume_url:               resumeUrl,
    eligible:                 true,
    reason:                   null,
    detected_domain:          ats.detected_domain,
    domain_confidence:        ats.domain_confidence,
    domain_label:             ats.domain_label,
    parsed_text:              parsed.parsedText,
    ats_score:                ats.ats_score,
    qa_match_score:           ats.qa_match_score,
    capability_score:         ats.capability_score,
    qa_seniority:             ats.qa_seniority,
    qa_hiring_label:          ats.qa_hiring_label,
    qa_specialization:        ats.qa_specialization,
    specialization_confidence: ats.specialization_confidence,
    recruiter_confidence:     ats.recruiter_confidence,
    career_level:             ats.career_level,
    profile_completion_score: computeProfileCompletion(user, parsed),
    score_breakdown:          ats.score_breakdown,
    qa_score_breakdown:       ats.qa_score_breakdown,
    extracted_skills:         parsed.extractedSkills,
    missing_skills:           ats.missing_skills,
    suggested_keywords:       ats.suggested_keywords,
    strengths:                ats.strengths,
    weaknesses:               ats.weaknesses,
    suggestions:              ats.suggestions,
    // ── Guidance intelligence (JSONB) ─────────────────────────────────────────
    improvement_priorities:   ats.improvement_priorities,
    score_explanations:       ats.score_explanations,
    career_roadmap:           ats.career_roadmap,
    recruiter_readiness:      ats.recruiter_readiness,
    improvement_impacts:      ats.improvement_impacts,
    specialization_guidance:  ats.specialization_guidance,
    recruiter_insights:       ats.recruiter_insights,
    action_plan:              ats.action_plan,
    // ── Evidence intelligence (JSONB — additive) ──────────────────────────────
    evidence_profile:         ats.evidence_profile,
    skill_evidence:           ats.skill_evidence,
    skill_timeline:           ats.skill_timeline,
    weak_evidence_skills:     ats.weak_evidence_skills,
    recruiter_trust_score:    ats.recruiter_trust_score,
    implementation_maturity:  ats.implementation_maturity,
    evidence_strength:        ats.evidence_strength,
    experience_depth_level:   ats.experience_depth_level,
    keyword_stuffing_risk:    ats.keyword_stuffing_risk,
    evidence_multiplier:      ats.evidence_multiplier,
    // ── Phase 4 + 5 intelligence (JSONB — additive) ──────────────────────────
    trust_breakdown:          ats.trust_breakdown,
    skill_recency:            ats.skill_recency,
    recency_summary:          ats.recency_summary,
    authenticity_profile:     ats.authenticity_profile,
    risk_flags:               ats.risk_flags,
    overall_risk_score:       ats.overall_risk_score,
    overall_risk_level:       ats.overall_risk_level,
    trajectory_profile:       ats.trajectory_profile,
    recommendation_mode:      ats.recommendation_mode,
    first_impression:         ats.first_impression,
    candidate_location:       parsed.contactInfo?.location ?? null,
    skill_metadata:           parsed.skillMetadata         ?? [],
    achievement_entries:      parsed.achievementEntries    ?? [],
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

  // Upsert keyed on (candidate_id, resume_url) so each distinct resume file
  // keeps its own analysis row. Re-analyzing the same URL overwrites; a new
  // upload URL creates a fresh row.
  const existing = await ResumeInsight.query().findOne({
    candidate_id: candidateId,
    resume_url:   resumeUrl,
  });
  let insight;
  if (existing) {
    insight = await existing.$query().patchAndFetch(payload);
  } else {
    insight = await ResumeInsight.query().insertAndFetch(payload);
  }

  // Phase 4: Save version snapshot (fire-and-forget — does not block response)
  saveVersionSnapshot(candidateId, {
    ...insight,
    total_skills_found: payload.total_skills_found,
    missing_skills:     payload.missing_skills,
  }, request.log);

  return reply.send({
    success: true,
    message: 'Resume parsed successfully.',
    data: {
      ...formatInsightResponse(insight, ats),
      detected_domain:   ats.detected_domain,
      domain_confidence: ats.domain_confidence,
    },
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
    id:                        insight.id,
    eligible:                  insight.eligible ?? true,
    // ── QA scores ──────────────────────────────────────────────────────────
    qa_match_score:            insight.qa_match_score,
    capability_score:          insight.capability_score,
    qa_hiring_label:           insight.qa_hiring_label,
    qa_specialization:         insight.qa_specialization,
    recruiter_confidence:      insight.recruiter_confidence,
    career_level:              insight.career_level,
    qa_score_breakdown:        insight.qa_score_breakdown,
    // ── Profile & band ─────────────────────────────────────────────────────
    band_label:               ats.band_label,
    band_color:               ats.band_color,
    // ── Parsed content ──────────────────────────────────────────────────────
    extracted_skills:         insight.extracted_skills,
    missing_skills:           insight.missing_skills,
    suggested_keywords:       insight.suggested_keywords,
    weaknesses:               insight.weaknesses,
    suggestions:              insight.suggestions,
    experience_entries:       insight.experience_entries,
    education_entries:        insight.education_entries,
    project_entries:          insight.project_entries,
    experience_years:         insight.experience_years,
    total_skills_found:       insight.total_skills_found,
    last_parsed_at:           insight.last_parsed_at,
    // ── Structured profile convenience fields ──────────────────────────────
    name:                     insight.contact_info?.name     ?? null,
    email:                    insight.contact_info?.email    ?? null,
    current_title:            insight.experience_entries?.[0]?.title   ?? null,
    current_company:          insight.experience_entries?.[0]?.company ?? null,
    skill_metadata:           insight.skill_metadata         ?? [],
    skill_strength_summary: (() => {
    const ev = insight.skill_evidence ?? [];
      return {
        very_strong: ev.filter(s => s.evidence_level === 'very_strong').length,
        strong:      ev.filter(s => s.evidence_level === 'strong').length,
        moderate:    ev.filter(s => s.evidence_level === 'moderate').length,
        weak:        ev.filter(s => s.evidence_level === 'weak').length,
        inferred:    (insight.skill_metadata ?? []).filter(s => s.evidence_level === 'inferred').length,
      };
    })(),
    certifications:           insight.certification_entries  ?? [],
    certification_count:      (insight.certification_entries ?? []).length,
    achievements:             insight.achievement_entries    ?? [],
    // ── Guidance intelligence ───────────────────────────────────────────────
    improvement_priorities:   insight.improvement_priorities,
    recruiter_readiness:      insight.recruiter_readiness,
    improvement_impacts:      insight.improvement_impacts,
    // ── Evidence intelligence ───────────────────────────────────────────────
    evidence_profile:         insight.evidence_profile,
    skill_evidence:           insight.skill_evidence,
    weak_evidence_skills:     insight.weak_evidence_skills,
    // ── Phase 4 + 5 intelligence ────────────────────────────────────────────
    trust_breakdown:          insight.trust_breakdown,
    skill_recency:            insight.skill_recency,
    recency_summary:          insight.recency_summary,
    risk_flags:               insight.risk_flags,
    overall_risk_score:       insight.overall_risk_score,
    overall_risk_level:       insight.overall_risk_level,
    // ── Parse quality ────────────────────────────────────────────────────────
    ...(() => {
      const wc = insight.word_count ?? 0;
      const parse_quality = wc < 50 ? 'failed' : wc < 150 ? 'poor' : wc < 300 ? 'fair' : wc < 500 ? 'good' : 'excellent';
      const parse_warning = wc < 150 ? 'Very little text was extracted from your resume. Some skills may not have been detected.' : null;
      return { parse_quality, parse_warning };
    })(),
  };
}
