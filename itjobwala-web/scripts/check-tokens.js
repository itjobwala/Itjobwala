#!/usr/bin/env node
/**
 * check-tokens.js — lint guard for raw palette values
 *
 * Flags Tailwind gray/slate utilities and arbitrary px text sizes that have
 * semantic token equivalents. Run with: node scripts/check-tokens.js
 *
 * Exit 0 = clean. Exit 1 = violations found.
 */

const fs   = require('fs');
const path = require('path');

// ── Config ─────────────────────────────────────────────────────────────────

const SCAN_ROOT = path.join(__dirname, '..', 'src');

/** File extensions to scan */
const EXTENSIONS = ['.tsx', '.ts', '.css'];

/**
 * Dirs (relative to SCAN_ROOT) whose raw-palette use is intentional and exempt.
 * Admin panel uses fully inline dark styles; dark sub-components use slate-* on dark bg.
 */
const EXEMPT_DIRS = [
  'features/admin',
];

/**
 * Patterns that are intentional and allowed anywhere (e.g. data-viz colors,
 * LinkedIn brand, score band). Matched against the full line text.
 */
const EXEMPT_LINE_PATTERNS = [
  /bg-indigo-[0-9]+/,           // QA/referral badges — intentional
  /bg-purple-[0-9]+/,           // seniority badges
  /bg-violet-[0-9]+/,           // chart accents
  /text-\[#0A66C2\]/,           // LinkedIn brand
  /\.tracking-tight/,
];

// ── Violation patterns ──────────────────────────────────────────────────────

const VIOLATIONS = [
  // Text color — gray/slate should use semantic tokens
  { re: /\btext-gray-[3-9][0-9][0-9]?\b/g,  msg: 'text-gray-* → use text-heading/body/muted/subtle/disabled' },
  { re: /\btext-slate-[3-9][0-9][0-9]?\b/g, msg: 'text-slate-* → use text-heading/body/muted/subtle/disabled' },
  { re: /\btext-zinc-[3-9][0-9][0-9]?\b/g,  msg: 'text-zinc-* → use text-heading/body/muted/subtle/disabled' },
  { re: /\btext-neutral-[3-9][0-9][0-9]?\b/g, msg: 'text-neutral-* → use text-heading/body/muted/subtle/disabled' },

  // Background — gray/slate/zinc should use surface tokens
  { re: /\bbg-gray-[0-9]+\b/g,    msg: 'bg-gray-* → use bg-surface/surface-alt/surface-hover/surface-mid' },
  { re: /\bbg-slate-[0-9]+\b/g,   msg: 'bg-slate-* → use bg-surface/surface-alt/surface-hover/surface-mid' },
  { re: /\bbg-zinc-[0-9]+\b/g,    msg: 'bg-zinc-* → use bg-surface/surface-alt/surface-hover/surface-mid' },
  { re: /\bbg-neutral-[0-9]+\b/g, msg: 'bg-neutral-* → use bg-surface/surface-alt/surface-hover/surface-mid' },
  { re: /\bbg-white\b/g,          msg: 'bg-white → use bg-surface' },

  // Border — gray/slate should use border tokens
  { re: /\bborder-gray-[0-9]+\b/g,    msg: 'border-gray-* → use border-token or border-token-mid' },
  { re: /\bborder-slate-[0-9]+\b/g,   msg: 'border-slate-* → use border-token or border-token-mid' },
  { re: /\bborder-zinc-[0-9]+\b/g,    msg: 'border-zinc-* → use border-token or border-token-mid' },
  { re: /\bborder-neutral-[0-9]+\b/g, msg: 'border-neutral-* → use border-token or border-token-mid' },

  // Arbitrary px that map to scale tokens
  { re: /\btext-\[11px\]/g,  msg: 'text-[11px] → text-micro' },
  { re: /\btext-\[12px\]/g,  msg: 'text-[12px] → text-caption' },
  { re: /\btext-\[13px\]/g,  msg: 'text-[13px] → text-sm' },
  { re: /\btext-\[14px\]/g,  msg: 'text-[14px] → text-base' },
  { re: /\btext-\[15px\]/g,  msg: 'text-[15px] → text-md' },
  { re: /\btext-\[16px\]/g,  msg: 'text-[16px] → text-lg' },
  { re: /\btext-\[18px\]/g,  msg: 'text-[18px] → text-xl' },
  { re: /\btext-\[20px\]/g,  msg: 'text-[20px] → text-2xl' },
  { re: /\btext-\[22px\]/g,  msg: 'text-[22px] → text-3xl' },
  { re: /\btext-\[32px\]/g,  msg: 'text-[32px] → text-5xl' },

  // Hardcoded neutral hex in className strings
  { re: /['"`][^'"`]*#(?:0f172a|374151|6b7280|9ca3af|94a3b8|d1d5db|e5e7eb|e2e8f0|f1f5f9|f8fafc|f9fafb|ffffff)[^'"`]*['"`]/gi,
    msg: 'Hardcoded neutral hex in className → use semantic token variable' },
];

// ── Scanner ─────────────────────────────────────────────────────────────────

function walkSync(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSync(full, results);
    } else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function isExemptFile(file) {
  const rel = path.relative(SCAN_ROOT, file).replace(/\\/g, '/');
  return EXEMPT_DIRS.some(d => rel.startsWith(d));
}

function isExemptLine(line) {
  return EXEMPT_LINE_PATTERNS.some(p => p.test(line));
}

const files  = walkSync(SCAN_ROOT);
const report = [];

for (const file of files) {
  if (isExemptFile(file)) continue;

  const lines   = fs.readFileSync(file, 'utf8').split('\n');
  const relPath = path.relative(process.cwd(), file);

  lines.forEach((line, idx) => {
    if (isExemptLine(line)) return;

    for (const { re, msg } of VIOLATIONS) {
      re.lastIndex = 0;
      const matches = line.match(re);
      if (matches) {
        report.push({ file: relPath, line: idx + 1, text: line.trim(), msg, matches });
      }
    }
  });
}

// ── Output ──────────────────────────────────────────────────────────────────

if (report.length === 0) {
  console.log('✓ No raw palette violations found.');
  process.exit(0);
}

// Group by file
const byFile = {};
for (const r of report) {
  (byFile[r.file] ??= []).push(r);
}

let total = 0;
for (const [file, hits] of Object.entries(byFile)) {
  console.log(`\n${file} (${hits.length} violation${hits.length > 1 ? 's' : ''})`);
  for (const h of hits) {
    console.log(`  ${String(h.line).padStart(4)}: [${h.msg}]`);
    console.log(`        ${h.text.slice(0, 120)}`);
    total += h.matches.length;
  }
}

console.log(`\n✖ ${total} violation(s) in ${Object.keys(byFile).length} file(s)`);
console.log('  See docs/UI_GUIDELINES.md for the token system reference.');
process.exit(1);
