import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Proxy function ───────────────────────────────────────────────────────────
// Route protection is handled client-side by ProtectedRoute /
// ProtectedRecruiterRoute components, which show a loading screen until the
// silent refresh (A4) settles and redirect to login if unauthenticated.
//
// The access token is no longer stored in a JS-readable cookie (A4 hardening),
// so the middleware cannot inspect it. Real auth enforcement is the backend's
// fastify.authenticate decorator on every protected API route.
//
// This middleware is kept as a pass-through so the matcher config below
// remains effective for future use (e.g. CSP headers, locale detection).

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
};
