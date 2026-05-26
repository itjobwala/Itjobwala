/**
 * Environment configuration — single source of truth for all env vars.
 *
 * Validated at module load time. Missing required vars throw immediately,
 * so misconfigured deployments fail on first request rather than silently
 * serving broken pages.
 *
 * Environments:
 *   local  → .env.local          (git-ignored, developer-owned)
 *   QA     → platform env vars   (set in Render/Vercel QA service)
 *   prod   → platform env vars   (set in Render/Vercel prod service)
 *
 * IMPORTANT: NEXT_PUBLIC_* vars must be accessed with their LITERAL names
 * (e.g. process.env.NEXT_PUBLIC_API_URL, not process.env[key]).
 * Next.js inlines them at build time via static analysis — dynamic access
 * (process.env[variable]) is not recognised and evaluates to undefined in
 * the browser even when the var is set.
 */

function requirePublic(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${name}\n` +
      `      Copy .env.example → .env.local and fill in the value.`,
    );
  }
  return value;
}

export const env = {
  // ── API ────────────────────────────────────────────────────────────────────
  // Base URL for all API requests. No trailing slash.
  // local: http://localhost:4001/api
  // QA:    https://api-qa.itjobwala.com/api
  // prod:  https://api.itjobwala.com/api
  apiUrl: requirePublic('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),

  // Socket.IO server URL — defaults to same origin as the API (strip /api suffix)
  // local: http://localhost:4001
  // QA:    https://api-qa.itjobwala.com
  socketUrl: (
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\/?$/, '')
  ),

  // ── Feature flags ──────────────────────────────────────────────────────────
  // Disable SSR for the auth navbar. Useful when debugging hydration mismatches.
  disableAuthNavbarSsr: process.env.NEXT_PUBLIC_DISABLE_AUTH_NAVBAR_SSR === 'true',

  // ── Runtime ────────────────────────────────────────────────────────────────
  nodeEnv: (process.env.NODE_ENV ?? 'development') as 'development' | 'test' | 'production',
  isDev:   process.env.NODE_ENV !== 'production',
  isProd:  process.env.NODE_ENV === 'production',
} as const;
