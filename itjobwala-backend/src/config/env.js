/**
 * Environment configuration — single source of truth for all env vars.
 *
 * Validated at startup. Missing required vars throw immediately so the
 * server refuses to start rather than serving requests with broken config.
 *
 * Environments:
 *   local → .env                (git-ignored, developer-owned)
 *   QA    → platform env vars   (Render QA service)
 *   prod  → platform env vars   (Render prod service)
 *
 * Variable reference: see .env.example at the repo root.
 */
import 'dotenv/config';

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${key}\n` +
      `      Copy .env.example → .env and fill in the value.`,
    );
  }
  return value;
}

function optional(key, fallback) {
  return process.env[key] || fallback;
}

export const env = {
  // ── Server ─────────────────────────────────────────────────────────────────
  port:    Number(optional('PORT', '4001')),
  nodeEnv: optional('NODE_ENV', 'development'),
  isDev:   process.env.NODE_ENV !== 'production',
  isProd:  process.env.NODE_ENV === 'production',

  // ── Database ───────────────────────────────────────────────────────────────
  // Supabase PostgreSQL with pgBouncer for connection pooling in QA/prod.
  // local:   postgresql://postgres:password@localhost:5432/itjobwala
  // QA/prod: postgresql://postgres.<ref>:<pass>@<host>:6543/postgres?pgbouncer=true
  databaseUrl: required('DATABASE_URL'),

  // ── Auth ───────────────────────────────────────────────────────────────────
  // Legacy secret — kept so existing tokens (pre-refresh-token rollout) still
  // pass verification. Once all sessions have rotated, this can be removed.
  jwtSecret: required('JWT_SECRET'),

  // Separate secrets for access vs refresh tokens.
  // Generate: openssl rand -hex 32
  accessTokenSecret:    required('ACCESS_TOKEN_SECRET'),
  refreshTokenSecret:   required('REFRESH_TOKEN_SECRET'),

  // Token lifetimes (parsed by jsonwebtoken's ms/zeit format)
  accessTokenExpiresIn:  optional('ACCESS_TOKEN_EXPIRES_IN', '15m'),
  refreshTokenExpiresIn: optional('REFRESH_TOKEN_EXPIRES_IN', '7d'),

  // Cookie config
  cookieSecure: process.env.NODE_ENV === 'production',

  // ── Cloudinary ─────────────────────────────────────────────────────────────
  // Used for resume, profile photo, and certificate file uploads.
  // https://console.cloudinary.com → Settings → API Keys
  cloudinary: {
    cloudName: required('CLOUDINARY_CLOUD_NAME'),
    apiKey:    required('CLOUDINARY_API_KEY'),
    apiSecret: required('CLOUDINARY_API_SECRET'),
  },

  // ── CORS ───────────────────────────────────────────────────────────────────
  // Comma-separated list of allowed frontend origins. No trailing slashes.
  // local:   http://localhost:3000
  // QA:      https://qa-web.itjobwala.com
  // prod:    https://itjobwala.com,https://www.itjobwala.com
  corsOrigins: optional('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),

  // ── Email / SMTP ────────────────────────────────────────────────────────────
  // Hostinger SMTP by default. Swap host/port/secure to change provider.
  // Reminder: SMTP mailbox + SPF/DKIM/DMARC DNS are configured outside the code.
  email: {
    host:   optional('EMAIL_HOST', 'smtp.hostinger.com'),
    port:   Number(optional('EMAIL_PORT', '465')),
    secure: optional('EMAIL_SECURE', 'true') === 'true',
    user:   required('EMAIL_USER'),
    pass:   required('EMAIL_PASS'),
    from:   optional('EMAIL_FROM', `"ITJobwala" <${process.env.EMAIL_USER}>`),
  },
};
