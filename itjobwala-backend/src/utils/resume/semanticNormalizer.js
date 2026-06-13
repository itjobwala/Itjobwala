/**
 * semanticNormalizer.js — Semantic entity enrichment layer.
 *
 * Runs AFTER section parsing, BEFORE ATS scoring.
 * Purely additive — preserves all existing output fields.
 *
 * New output:
 *   semanticProjects  — merged projects from PROJECTS section + embedded in EXPERIENCE
 *   skillEvidenceMap  — { [skill]: { evidence[], linked_projects[], evidence_strength, evidence_score } }
 *   projectConfidence — [{ project_name, confidence, detection_sources }]
 *   nestedExperience  — experienceEntries enriched with embedded `projects` arrays
 */

import { splitIntoSections, isTechnologyStackLine } from './resumeSections.js';
import { extractSkillsFromText }                    from './normalizeSkills.js';

// ── Shared constants ──────────────────────────────────────────────────────────

const BULLET_RE     = /^[\-•*◦▸]\s+|^\d+\.\s+/;
const TOOLS_LINE_RE = /\btools?\s*(?:used\s*)?:/i;
const YEAR_RANGE_RE = /(\b(?:19|20)\d{2}\b)[\s\-–—,]+(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\w*[\s,]+)?(\b(?:19|20)\d{2}\b|present|current|now)/i;

// Matches quantified achievements in bullet text
const METRIC_RE = /(?:\d[\d,]*\+?\s*(?:test\s*cases?|test\s*scripts?|automation\s*scripts?|scenarios?|endpoints?|api\s*(?:calls?|endpoints?|assertions?)|assertions?|bugs?|defects?|issues?|modules?|features?|screens?|flows?)|(?:\d+%|\d+x|\d+\s*times?)\s*(?:reduction|improvement|increase|faster|coverage|efficiency|accuracy|savings?|decrease|optimization)|(?:reduced?|improved?|increased?|decreased?|saved?)\s+\w+(?:\s+\w+)?\s+by\s+\d+%?|\$[\d,]+[KMB]?\s*(?:savings?|cost|revenue|value)?|\d+\+?\s*(?:hrs?|hours?)\s*(?:saved?|reduced?|automated?))/gi;

const DEPTH_MARKERS = [
  'framework', 'architecture', 'designed', 'implemented', 'built',
  'developed', 'integrated', 'optimized', 'automated', 'pom',
  'page object', 'data-driven', 'bdd', 'tdd', 'end-to-end',
  'regression suite', 'test strategy', 'test design',
];

// ── Project Header Detection ──────────────────────────────────────────────────

const PROJECT_LABEL_RE = /\b(domain|project|client|module|product|platform|application|system|portal|suite|app|dashboard|engine|service|component|track|stream)\s*:/i;
const PRODUCT_NOUN_RE  = /\b(suite|portal|platform|dashboard|application|system|engine|service|gateway|hub|cloud|studio|console|manager|center|workspace|marketplace|exchange|network)\b/i;
const ACRONYM_RE       = /\([A-Z]{2,6}\)/;

// Functional-component suffixes that indicate a subsystem, not a standalone product
const SUBSYSTEM_SUFFIX_RE = /\b(engine|module|workflow|integration|pipeline|subsystem|processor|middleware|handler|component)\s*$/i;
// Anchors that strongly indicate a standalone parent project
const PRODUCT_NOUN_PARENT_RE = /\b(suite|portal|platform|dashboard|marketplace|exchange|workspace|studio|console|hub|network)\b/i;

export function isLikelyProjectHeader(line) {
  const t = line.trim();
  if (!t || t.length > 140 || BULLET_RE.test(t) || /[.!?]$/.test(t)) return false;

  // Tech stack lines must never become project headers
  if (isTechnologyStackLine(t)) return false;

  if (/\|/.test(t))                                                   return true;
  if (PROJECT_LABEL_RE.test(t))                                       return true;
  if (ACRONYM_RE.test(t) && /^[A-Z]/.test(t) && t.length < 100)      return true;
  if (PRODUCT_NOUN_RE.test(t) && /^[A-Z]/.test(t) && t.length < 100) return true;
  if (/[–—]/.test(t) && t.search(/[–—]/) > 0 && t.search(/[–—]/) < 60 && t.length < 140) return true;
  return false;
}

function detectEmbeddedEntityType(name, hasOpenParent) {
  const t = (name || '').trim();
  if (ACRONYM_RE.test(t))              return 'parent_project';
  if (PRODUCT_NOUN_PARENT_RE.test(t))  return 'parent_project';
  if (/[–—]/.test(t))                 return 'parent_project';
  if (PROJECT_LABEL_RE.test(t) && /domain\s*:/i.test(t)) return 'parent_project';
  if (hasOpenParent && SUBSYSTEM_SUFFIX_RE.test(t)) return 'subsystem';
  return 'parent_project';
}

// Pipe-separated lines can have the project name in ANY position, e.g.:
//   "Meta Business Suite (MBS) | Domain: Social Media | Meta"  → part 0
//   "Social Media Management | Meta Business Suite (MBS) | 1.6 Years" → part 1
// We rank all pipe parts and pick the best one.
const DURATION_PART_RE    = /^\s*(?:\d+\.?\d*\s*(?:years?|months?|yrs?)|\d{4}\s*[-–—]\s*(?:\d{4}|present|current|now))\s*$/i;
const METADATA_LABEL_RE   = /^\s*(domain|client|platform|category|tech(?:nology)?(?:\s+stack)?|type)\s*:/i;
const APP_PREFIX_STRIP_RE = /^\b\w+\s+app\s*:\s*/i;

function extractProjectName(line) {
  const parts = line.split('|').map(p => p.trim()).filter(Boolean);

  // Remove pure duration and metadata-label parts
  const candidates = parts.filter(p =>
    !DURATION_PART_RE.test(p) &&
    !METADATA_LABEL_RE.test(p) &&
    p.length > 2
  );

  const pool = candidates.length ? candidates : [parts[0] ?? ''];

  // Pick best: prefer part with an acronym (MBS), then product noun, else first
  let best = pool[0];
  for (const p of pool) {
    if (/\([A-Z]{2,6}\)/.test(p)) { best = p; break; }
    if (PRODUCT_NOUN_RE.test(p) && !PRODUCT_NOUN_RE.test(best)) best = p;
  }

  return best
    .replace(/\([A-Z]{2,6}\)\s*/g, '')         // strip (MBS)
    .replace(APP_PREFIX_STRIP_RE, '')            // strip "Communication App: "
    .replace(/\b(project|client|module|platform)\s*:\s*/gi, '')
    .replace(/\s*[-–—]\s*$/, '')
    .trim();
}

function extractDomain(line) {
  const m = line.match(/domain\s*:\s*([^|]+)/i);
  return m ? m[1].trim() : null;
}

function extractPlatforms(line) {
  const lower = line.toLowerCase();
  const found = [];
  if (/\bweb\b/.test(lower))     found.push('Web');
  if (/\bandroid\b/.test(lower)) found.push('Android');
  if (/\bios\b/.test(lower))     found.push('iOS');
  if (/\bmobile\b/.test(lower) && !found.includes('Android') && !found.includes('iOS')) found.push('Mobile');
  return found;
}

function extractMetrics(text) {
  METRIC_RE.lastIndex = 0;
  return [...new Set((text.match(METRIC_RE) ?? []).map(m => m.trim()))];
}

// ── Embedded Project Extraction (from EXPERIENCE section) ─────────────────────

export function extractEmbeddedProjects(parsedText) {
  if (!parsedText) return [];

  const sections = splitIntoSections(parsedText);
  const expLines = sections['experience'] ?? [];

  const projects     = [];
  let currentCompany = null;
  let currentRole    = null;
  let currentProject = null;
  let lastParentIdx  = -1;

  const pushProject = () => {
    if (!currentProject) return;
    currentProject.tools       = [...new Set(currentProject.tools)];
    currentProject.metrics     = [...new Set(currentProject.metrics)];
    currentProject.description = currentProject.responsibilities.join(' ');
    // Promote subsystem to parent if it has substantial content
    if (currentProject.entity_type === 'subsystem' && currentProject.responsibilities.length >= 3) {
      currentProject.entity_type = 'parent_project';
    }
    if (currentProject.name) {
      if (currentProject.entity_type === 'parent_project') lastParentIdx = projects.length;
      projects.push(currentProject);
    }
    currentProject = null;
  };

  for (const line of expLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (YEAR_RANGE_RE.test(trimmed)) {
      pushProject();
      lastParentIdx = -1; // new role = new parent context
      const before = trimmed.replace(YEAR_RANGE_RE, '').replace(/[-–—]\s*$/, '').trim();
      if (before) {
        const parts = before.split(/\s+[-–—@]\s+/);
        currentRole    = parts[0]?.trim() ?? null;
        currentCompany = parts.length >= 2 ? parts[parts.length - 1].trim() : currentCompany;
      }
      continue;
    }

    if (isLikelyProjectHeader(trimmed)) {
      pushProject();
      const name       = extractProjectName(trimmed);
      const entityType = detectEmbeddedEntityType(name, lastParentIdx >= 0);

      currentProject = {
        name,
        entity_type:      entityType,
        domain:           extractDomain(trimmed),
        platforms:        extractPlatforms(trimmed),
        company:          currentCompany,
        role:             currentRole,
        tools:            extractSkillsFromText(trimmed),
        metrics:          [],
        responsibilities: [],
        description:      '',
        detection_sources: ['experience_section'],
      };
      continue;
    }

    if (!currentProject) continue;

    if (TOOLS_LINE_RE.test(trimmed)) {
      const toolText = trimmed.replace(TOOLS_LINE_RE, '');
      currentProject.tools.push(...extractSkillsFromText(toolText));
      continue;
    }

    if (BULLET_RE.test(trimmed)) {
      const text = trimmed.replace(/^[\-•*◦▸]\s+/, '').replace(/^\d+\.\s+/, '');
      currentProject.metrics.push(...extractMetrics(text));
      currentProject.tools.push(...extractSkillsFromText(text));
      if (text.length > 15) currentProject.responsibilities.push(text);
    }
  }

  pushProject();
  return projects;
}

// ── Project Domain Classification ────────────────────────────────────────────

const STRONG_QA_TOOLS = new Set([
  'selenium', 'playwright', 'cypress', 'testng', 'junit', 'cucumber', 'rest assured',
  'appium', 'jmeter', 'k6', 'gatling', 'sdet', 'webdriverio', 'katalon', 'postman',
  'testrail', 'zephyr', 'qtest', 'bugzilla', 'specflow', 'nunit', 'pytest-bdd', 'robot framework',
]);

const QA_DOMAIN_PATTERNS = {
  performance_testing: /\b(jmeter|k6|gatling|locust|blazemeter|load\s+test|performance\s+test|stress\s+test|endurance\s+test|throughput|sla\s+validat)\b/i,
  mobile_testing:      /\b(appium|android\s+test|ios\s+test|mobile\s+test|espresso|xcuitest|device\s+farm|real\s+device)\b/i,
  api_testing:         /\b(postman|rest\s+assured|api\s+test|api\s+autom|soapui|contract\s+test|api\s+valid|graphql\s+test|swagger\s+test)\b/i,
  sdet:                /\b(sdet|test\s+framework|automation\s+framework|framework\s+architect|test\s+infrastructure|page\s+object\s+model|pom)\b/i,
  manual_qa:           /\b(manual\s+test|test\s+case|test\s+plan|test\s+execution|exploratory\s+test|uat|acceptance\s+test|functional\s+test\b)\b/i,
  qa_automation:       /\b(selenium|playwright|cypress|testng|junit|cucumber|bdd|webdriverio|katalon|automation\s+suite|regression\s+suite|e2e\s+test|ui\s+autom)\b/i,
};

const NON_QA_DOMAIN_PATTERNS = {
  // Specific business domains first — wins over generic tech signals (mongodb, react, etc.)
  fintech:    /\b(fintech|payment\s*(?:gateway|processing|system)?|banking|transaction|digital\s*wallet|wallet|trading|investment|stock\s*(?:market|exchange)?|crypto(?:currency)?|blockchain|ledger|finance|wealth\s*(?:management)?|insurance|lending|loan|deposit|forex|currency|upi|neft|rtgs|swift|sepa|fund(?:ing)?|brokerage|equity)\b/i,
  // Phase 7: ticketing/booking domain
  ticketing:  /\b(booking|reservation|ticket(?:ing)?|event\s*(?:management|booking|platform)?|attendee|venue|concert|cinema|theatre|flight\s*(?:booking|reservation)?|hotel\s*(?:booking|reservation)?|travel\s*(?:booking|platform)?|seat(?:ing)?|schedule\s*(?:booking)?)\b/i,
  // Phase 7: expanded ai_ml — RAG, ChromaDB, vector stores, fine-tuning
  ai_ml:      /\b(machine\s+learning|deep\s+learning|nlp|llm|tensorflow|pytorch|langchain|openai|embeddings?|vector\s+(?:db|database|store|search)|huggingface|gpt|bert|neural|scikit|rag\b|chromadb|pinecone|weaviate|faiss|chroma\b|ann\b|diffusion\s+model|transformer\s+model|fine[\s-]?tun(?:ing|ed)?|llama|mistral|gemini|claude\s+api)\b/i,
  devops:     /\b(terraform|ansible|kubernetes|k8s|docker\s+compose|infrastructure|ci\/cd\s+pipeline|devops|helm|argocd|prometheus|grafana)\b/i,
  cloud:      /\b(aws\s+lambda|s3\s+bucket|azure\s+function|gcp|cloud\s+function|serverless|dynamodb|cloudformation|ec2|ecs)\b/i,
  mobile_dev: /\b(flutter|react\s+native|swift\s+ui|swiftui|android\s+studio|ios\s+dev|kotlin\s+android|jetpack)\b/i,
  frontend:   /\b(react\b|angular\b|vue\b|next\.js|nuxt|svelte|html5|css3|tailwind|bootstrap|redux|zustand|ui\/ux|figma|responsive\s+design)\b/i,
  backend:    /\b(spring\s+boot|django|flask|fastapi|express\.js|nestjs|laravel|rails|graphql\s+api|rest\s+api|microservices|kafka|rabbitmq|postgresql|mysql|mongodb)\b/i,
  fullstack:  /\b(mern|mean|mevn|full[\s-]stack|fullstack|lamp\s+stack|django\s+react|spring\s+boot.*react|node.*react)\b/i,
};

/**
 * Classify a project into a domain (qa_automation, backend, ai_ml, etc.).
 * Looks at project name, description, responsibilities, and tools combined.
 */
export function classifyProjectDomain(project) {
  const corpus = [
    project.name            ?? '',
    project.description     ?? '',
    ...(project.responsibilities ?? []),
    ...(project.tools            ?? []),
  ].join(' ');

  const lower = corpus.toLowerCase();

  // Count strong QA tool hits — highest specificity signal
  const strongQaHits = [...STRONG_QA_TOOLS].filter(t => lower.includes(t)).length;

  if (strongQaHits >= 2) {
    return { project_type: _subclassifyQA(lower), confidence: Math.min(95, 60 + strongQaHits * 7) };
  }

  // Check non-QA domains first when there's a single weak QA signal
  for (const [domain, re] of Object.entries(NON_QA_DOMAIN_PATTERNS)) {
    if (re.test(corpus)) {
      // Only override if no QA sub-pattern also matches
      const qaPatternMatch = Object.values(QA_DOMAIN_PATTERNS).some(qr => qr.test(corpus));
      if (!qaPatternMatch) return { project_type: domain, confidence: 70 };
    }
  }

  if (strongQaHits === 1) {
    return { project_type: _subclassifyQA(lower), confidence: 55 };
  }

  // Medium QA signals
  for (const [domain, re] of Object.entries(QA_DOMAIN_PATTERNS)) {
    if (re.test(corpus)) return { project_type: domain, confidence: 50 };
  }

  return { project_type: 'general', confidence: 20 };
}

function _subclassifyQA(lower) {
  if (QA_DOMAIN_PATTERNS.performance_testing.test(lower)) return 'performance_testing';
  if (QA_DOMAIN_PATTERNS.mobile_testing.test(lower))      return 'mobile_testing';
  if (QA_DOMAIN_PATTERNS.api_testing.test(lower))         return 'api_testing';
  if (QA_DOMAIN_PATTERNS.sdet.test(lower))                return 'sdet';
  if (QA_DOMAIN_PATTERNS.manual_qa.test(lower))           return 'manual_qa';
  return 'qa_automation';
}

const QA_DOMAINS = new Set(['qa_automation', 'manual_qa', 'api_testing', 'performance_testing', 'mobile_testing', 'sdet']);

/**
 * Build recruiter-grade project statistics from resolved semantic projects.
 * Only parent_project entities count toward totals — subsystems are excluded.
 */
export function buildProjectStats(semanticProjects) {
  const parentProjects = (semanticProjects ?? []).filter(p => p.entity_type !== 'subsystem');
  const breakdown      = {};

  for (const p of parentProjects) {
    const domain = p.project_domain ?? 'general';
    breakdown[domain] = (breakdown[domain] ?? 0) + 1;
  }

  const qaCount    = parentProjects.filter(p => QA_DOMAINS.has(p.project_domain)).length;
  const nonQaCount = parentProjects.length - qaCount;

  return {
    total_projects:    parentProjects.length,
    qa_projects:       qaCount,
    non_qa_projects:   nonQaCount,
    project_breakdown: breakdown,
  };
}

// ── Project Canonicalization ──────────────────────────────────────────────────

// Strips parentheticals BEFORE removing non-alpha chars so "(MBS)" doesn't
// leave stray letters that break exact-match dedup.
export function canonicalizeProjectName(name = '') {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')        // remove (MBS), (v2), (Phase 1), etc.
    .replace(/[^a-z0-9\s]/g, ' ')  // strip special chars
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccard(a, b) {
  const sa    = new Set(a.split(' ').filter(Boolean));
  const sb    = new Set(b.split(' ').filter(Boolean));
  const inter = [...sa].filter(x => sb.has(x)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
}

function toolOverlap(a, b) {
  const ta = new Set((a.tools ?? []).map(t => t.toLowerCase()));
  const tb = new Set((b.tools ?? []).map(t => t.toLowerCase()));
  return [...ta].filter(x => tb.has(x)).length;
}

// Multi-signal duplicate detection — any ONE strong signal is sufficient.
export function isSameProject(a, b) {
  const na = canonicalizeProjectName(a.name);
  const nb = canonicalizeProjectName(b.name);
  if (!na || !nb) return false;

  // Name signals
  if (na === nb)                          return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  if (jaccard(na, nb) >= 0.55)            return true;

  // Corroborating evidence: shared domain + reasonable name overlap
  if (a.domain && b.domain && a.domain.toLowerCase() === b.domain.toLowerCase()
      && jaccard(na, nb) >= 0.3)          return true;

  // Corroborating evidence: heavy tool overlap (≥ 3 shared tools) + some name overlap
  if (toolOverlap(a, b) >= 3 && jaccard(na, nb) >= 0.25) return true;

  return false;
}

// ── Project Entity Merging ────────────────────────────────────────────────────

export function mergeProjectEntities(base, incoming) {
  const mergedSources = [...new Set([
    ...(base.detection_sources ?? []),
    ...(incoming.detection_sources ?? []),
  ])];

  return {
    ...base,
    tools:             [...new Set([...(base.tools ?? []),            ...(incoming.tools ?? [])])],
    metrics:           [...new Set([...(base.metrics ?? []),          ...(incoming.metrics ?? [])])],
    responsibilities:  [...new Set([...(base.responsibilities ?? []), ...(incoming.responsibilities ?? [])])],
    detection_sources: mergedSources,
    platforms:         [...new Set([...(base.platforms ?? []),        ...(incoming.platforms ?? [])])],
    domain:            base.domain ?? incoming.domain,
    company:           base.company ?? incoming.company,
    description:       [base.description, incoming.description].filter(Boolean).join(' '),
    merged:            mergedSources.length > 1,  // true when cross-verified
  };
}

// ── Project Confidence Scoring ────────────────────────────────────────────────

export function computeProjectConfidence(project) {
  let score = 50;

  const sources     = project.detection_sources ?? [];
  const metricCount = (project.metrics ?? []).length;
  const toolCount   = (project.tools ?? []).length;
  const respCount   = (project.responsibilities ?? []).length;

  if (sources.includes('experience_section')) score += 18;
  if (sources.includes('projects_section'))   score += 12;
  if (sources.length > 1)                     score += 10; // cross-verified boost
  if (project.merged)                         score += 5;  // entity resolution bonus

  if (metricCount >= 2) score += 15; else if (metricCount) score += 8;
  if (toolCount   >= 3) score += 10; else if (toolCount)   score += 5;
  if (respCount   >= 3) score += 8;
  if (project.domain)            score += 4;
  if (project.platforms?.length) score += 3;

  if ((metricCount + toolCount + respCount) < 2) score -= 20;

  return Math.min(Math.max(score, 10), 100);
}

// ── Entity Resolution (dedup + merge pipeline) ───────────────────────────────

export function resolveProjectEntities(sectionProjects, embeddedProjects) {
  const pool = [
    ...(sectionProjects ?? []).map(p => ({
      ...p,
      detection_sources: p.detection_sources ?? ['projects_section'],
      tools:             p.tools ?? [],
      metrics:           p.metrics ?? [],
      responsibilities:  p.responsibilities ?? [],
      platforms:         p.platforms ?? [],
      entity_type:       p.entity_type ?? 'parent_project',
      merged:            false,
    })),
    ...(embeddedProjects ?? []),
  ];

  const resolved = [];
  for (const p of pool) {
    if (!p.name) continue;
    const idx = resolved.findIndex(m => isSameProject(m, p));
    if (idx >= 0) {
      resolved[idx] = mergeProjectEntities(resolved[idx], p);
    } else {
      resolved.push({ ...p, merged: false });
    }
  }

  // Stamp canonical_name and project_domain on every resolved entity
  return resolved.map(p => {
    const domainResult = classifyProjectDomain(p);
    return {
      ...p,
      canonical_name: canonicalizeProjectName(p.name),
      project_domain: domainResult.project_type,
      domain_confidence: domainResult.confidence,
    };
  });
}

// ── Skill Evidence Map ────────────────────────────────────────────────────────

function evidenceStrength(metricCount, linkedCount, hasDepth) {
  if (metricCount >= 2 && linkedCount > 0)          return 'strong';
  if (metricCount >= 1 || (linkedCount > 0 && hasDepth)) return 'moderate';
  if (linkedCount > 0)                               return 'basic';
  return 'mention';
}

function calcEvidenceScore(metricCount, linkedCount, hasDepth) {
  let s = 30;
  s += Math.min(metricCount * 15, 30);
  s += Math.min(linkedCount  * 12, 24);
  if (hasDepth) s += 16;
  return Math.min(s, 100);
}

export function buildSkillEvidenceMap(skills, parsedText, semanticProjects) {
  const map    = {};
  const WINDOW = 300;

  for (const skill of (skills ?? [])) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re      = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'gi');

    const windows = [];
    let m;
    while ((m = re.exec(parsedText)) !== null) {
      const s = Math.max(0, m.index - WINDOW);
      const e = Math.min(parsedText.length, m.index + skill.length + WINDOW);
      windows.push(parsedText.slice(s, e));
    }

    if (!windows.length) {
      map[skill] = { evidence: [], linked_projects: [], evidence_strength: 'mention', evidence_score: 10 };
      continue;
    }

    const ctx      = windows.join(' ');
    const metrics  = extractMetrics(ctx);
    const hasDepth = DEPTH_MARKERS.some(d => ctx.toLowerCase().includes(d));

    const linkedProjects = (semanticProjects ?? [])
      .filter(p =>
        (p.tools ?? []).some(t => t.toLowerCase() === skill.toLowerCase()) ||
        (p.responsibilities ?? []).some(r => r.toLowerCase().includes(skill.toLowerCase()))
      )
      .map(p => p.name);

    const evidence = ctx
      .split(/[.\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200 && new RegExp(escaped, 'i').test(s))
      .slice(0, 4);

    map[skill] = {
      evidence,
      linked_projects:   [...new Set(linkedProjects)],
      evidence_strength: evidenceStrength(metrics.length, linkedProjects.length, hasDepth),
      evidence_score:    calcEvidenceScore(metrics.length, linkedProjects.length, hasDepth),
    };
  }

  return map;
}

// ── Nested Experience Builder ─────────────────────────────────────────────────

export function buildNestedExperience(experienceEntries, embeddedProjects) {
  return (experienceEntries ?? []).map(entry => {
    const prefix = (entry.company ?? '').toLowerCase().slice(0, 8);
    const projects = (embeddedProjects ?? []).filter(p =>
      prefix && p.company && p.company.toLowerCase().startsWith(prefix)
    );
    return { ...entry, projects };
  });
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

export function normalizeResumeEntities(parsedResume) {
  const embeddedProjects = extractEmbeddedProjects(parsedResume.parsedText ?? '');

  const semanticProjects = resolveProjectEntities(
    parsedResume.projectEntries ?? [],
    embeddedProjects,
  ).map(p => ({ ...p, confidence: computeProjectConfidence(p) }));

  const skillEvidenceMap = buildSkillEvidenceMap(
    parsedResume.extractedSkills ?? [],
    parsedResume.parsedText ?? '',
    semanticProjects,
  );

  const projectConfidence = semanticProjects.map(p => ({
    project_name:      p.name,
    confidence:        p.confidence,
    detection_sources: p.detection_sources ?? [],
    entity_type:       p.entity_type ?? 'parent_project',
    project_domain:    p.project_domain ?? 'general',
  }));

  const nestedExperience = buildNestedExperience(
    parsedResume.experienceEntries ?? [],
    embeddedProjects,
  );

  const projectStats = buildProjectStats(semanticProjects);

  return { semanticProjects, skillEvidenceMap, projectConfidence, nestedExperience, projectStats };
}

// ── Phase 5: Block Classification ────────────────────────────────────────────

// Lightweight degree-keyword pattern used only by classifyBlock (full list lives in resumeSections.js)
const BLOCK_DEGREE_RE   = /\b(b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|mba|bba|phd|ph\.d|bachelor|master|doctorate|diploma|bca|mca|associate|b\.?s|m\.?s)\b/i;
const BLOCK_DATE_RE     = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[\s,]+\d{4}|\b(?:19|20)\d{2}\b[\s\-–—]+(?:\b(?:19|20)\d{2}\b|present|current|now)/i;
const BLOCK_JOB_TITLE   = /\b(engineer|developer|analyst|manager|architect|lead|consultant|specialist|intern|tester|designer|scientist|officer|director|founder)\b/i;
const BLOCK_COMPANY_RE  = /\b(technologies|solutions|systems|services|consulting|pvt|ltd|llp|inc|llc|corp|group|international|enterprises?|industries)\b/i;
const BLOCK_PRODUCT_RE  = /\b(platform|dashboard|application|system|portal|suite|marketplace|engine|gateway|hub|studio|console)\b/i;

/**
 * Classify a text block into a resume section type with a confidence score.
 *
 * @param {{ heading?: string, content?: string }} block
 * @returns {{ type: 'experience'|'project'|'education'|'skills'|'certification'|'unknown', confidence: number }}
 */
export function classifyBlock({ heading = '', content = '' } = {}) {
  const fullText  = [heading, content].filter(Boolean).join('\n');
  const firstLine = (heading || fullText.split('\n')[0] || '').trim();
  const textLines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
  const scores    = { experience: 0, project: 0, education: 0, skills: 0, certification: 0 };

  // ── Experience signals ────────────────────────────────────────────────────
  if (BLOCK_DATE_RE.test(fullText))     scores.experience += 35;
  if (BLOCK_JOB_TITLE.test(fullText))   scores.experience += 20;
  if (/\b(present|current)\b/i.test(fullText)) scores.experience += 10;
  if (BLOCK_COMPANY_RE.test(fullText))  scores.experience += 10;

  // ── Project signals ───────────────────────────────────────────────────────
  if (/[–—]/.test(firstLine) && firstLine.length < 100)            scores.project += 40;
  if (textLines.some(l => isTechnologyStackLine(l)))               scores.project += 35;
  if (BLOCK_PRODUCT_RE.test(firstLine) && /^[A-Z]/.test(firstLine)) scores.project += 20;
  if (/\([A-Z]{2,6}\)/.test(firstLine))                            scores.project += 15;

  // ── Education signals ─────────────────────────────────────────────────────
  if (BLOCK_DEGREE_RE.test(fullText))                                    scores.education += 50;
  if (/\b(university|college|institute|iit|nit|bits|school)\b/i.test(fullText)) scores.education += 20;
  if (/\b(cgpa|gpa|percentage|marks)\b/i.test(fullText))                scores.education += 15;

  // ── Skills signals ────────────────────────────────────────────────────────
  const skillCount  = extractSkillsFromText(fullText).length;
  const commaLists  = (fullText.match(/(?:\w[\w. ]+,\s*){2,}/g) ?? []).length;
  if (commaLists >= 1 && skillCount >= 3) scores.skills += 40;
  if (skillCount >= 6)                    scores.skills += 20;

  // ── Certification signals ─────────────────────────────────────────────────
  if (/\b(certified|certification|certificate|credential|licen[sc]e)\b/i.test(fullText)) scores.certification += 50;
  if (/\b(istqb|aws\s*certified|cka|ckad|pmp|scrum\s*master|cissp|ceh)\b/i.test(fullText)) scores.certification += 25;

  const [bestType, bestScore] = Object.entries(scores).reduce(
    (best, cur) => cur[1] > best[1] ? cur : best,
    ['unknown', 0],
  );
  if (bestScore === 0) return { type: 'unknown', confidence: 0 };
  return { type: bestType, confidence: Math.min(95, 40 + bestScore) };
}
