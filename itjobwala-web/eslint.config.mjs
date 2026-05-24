import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

// ── Feature registry ────────────────────────────────────────────────────────
// Every entry MUST have a top-level index.ts that acts as its public API.
const FEATURES = [
  'auth',
  'home',
  'navbar',
  'candidate/applications',
  'candidate/dashboard',
  'candidate/profile',
  'candidate/saved-jobs',
  'jobs/browse',
  'jobs/detail',
  'jobs/shared',
  'recruiter/applicants',
  'recruiter/company',
  'recruiter/dashboard',
  'recruiter/hooks',
  'recruiter/interviews',
  'recruiter/jobs',
];

// Sub-directory names that are considered internal (not public API surface).
// Importing @/features/foo/<INTERNAL>/<file> from OUTSIDE foo is banned.
const INTERNALS = ['components', 'hooks', 'services', 'schemas', 'utils', 'steps'];

// ── Pattern builders ─────────────────────────────────────────────────────────

/** All deep-internal glob patterns for a single feature. */
function internalPatterns(feature) {
  return INTERNALS.map(dir => `@/features/${feature}/${dir}/**`);
}

/**
 * Build a no-restricted-imports patterns array for `context`.
 * - 'global' → ban every feature's internals (used in shared/layout/app code)
 * - a feature path → ban all OTHER features' internals (used inside that feature)
 */
function restrictedPatterns(context) {
  const banned =
    context === 'global'
      ? FEATURES.flatMap(internalPatterns)
      : FEATURES.filter(f => f !== context).flatMap(internalPatterns);

  return [
    {
      group: banned,
      message:
        "Import from the feature's public index (e.g. '@/features/foo') instead of its internals.",
    },
  ];
}

// ── Shared rule sets ─────────────────────────────────────────────────────────

const importOrder = {
  'import/order': [
    'warn',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'never',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
  'import/no-duplicates': 'warn',
};

// ── ESLint config ────────────────────────────────────────────────────────────

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  // ── import plugin: order + duplicates (project-wide) ──────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { import: importPlugin },
    rules: importOrder,
  },

  // ── Boundary enforcement: shared / layout / app code ──────────────────────
  // src/app, src/components, src/hooks, src/lib, src/contexts, src/types, etc.
  // None of these should reach into feature internals.
  {
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
      'src/contexts/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: restrictedPatterns('global') }],
    },
  },

  // ── Boundary enforcement: per-feature ─────────────────────────────────────
  // Each feature block allows its OWN internals, bans all OTHER features'.
  ...FEATURES.map(feature => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': ['error', { patterns: restrictedPatterns(feature) }],
    },
  })),
]);

export default eslintConfig;
