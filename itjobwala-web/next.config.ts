import type { NextConfig } from "next";

// Validate required env vars at build time so `next build` fails loudly
// rather than producing a broken bundle.
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_API_URL',
] as const;

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(
      `[next.config] Missing required environment variable: ${key}\n` +
      `  Copy .env.example → .env.local and fill in the value.`,
    );
  }
}

const nextConfig: NextConfig = {};

export default nextConfig;
