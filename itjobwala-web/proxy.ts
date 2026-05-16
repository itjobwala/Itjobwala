import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Route lists ─────────────────────────────────────────────────────────────

/** Exact-match candidate-protected paths */
const CANDIDATE_PROTECTED = ['/dashboard', '/profile', '/saved-jobs', '/applications'];

/** Prefix-match candidate-protected paths */
const CANDIDATE_PROTECTED_PREFIXES = ['/jobs/apply'];

/** Pages that authenticated candidates should not see */
const CANDIDATE_AUTH_ROUTES = ['/login', '/signup'];

/** Pages that unauthenticated recruiters cannot access */
const RECRUITER_AUTH_ROUTES = ['/recruiter/login', '/recruiter/signup'];

// ── JWT helpers (Edge-safe, payload decode only) ─────────────────────────────

interface TokenPayload {
  role?: string;
  exp?:  number;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const padded  = segment.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(padded);
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: TokenPayload): boolean {
  if (!payload.exp) return false;
  return Date.now() / 1000 > payload.exp;
}

// ── Proxy function ───────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Candidate auth ───────────────────────────────────────────────────────
  const rawToken = request.cookies.get('token')?.value;
  const payload  = rawToken ? decodeToken(rawToken) : null;

  const role             = payload?.role?.toLowerCase() ?? '';
  const isCandidateToken = !!rawToken && !isTokenExpired(payload ?? {});
  const isCandidateRole  = role === 'candidate' || role === '';
  const isCandidateAuth  = isCandidateToken && isCandidateRole;

  const isCandidateProtected =
    CANDIDATE_PROTECTED.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    CANDIDATE_PROTECTED_PREFIXES.some(p => pathname.startsWith(p));

  const isCandidateAuthRoute = CANDIDATE_AUTH_ROUTES.some(r => pathname === r);

  if (isCandidateProtected && !isCandidateAuth) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isCandidateAuthRoute && isCandidateAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Recruiter auth ───────────────────────────────────────────────────────
  const recruiterRawToken = request.cookies.get('recruiter_token')?.value;
  const recruiterPayload  = recruiterRawToken ? decodeToken(recruiterRawToken) : null;
  const isRecruiterAuth   = !!recruiterRawToken && !isTokenExpired(recruiterPayload ?? {});

  const isRecruiterProtected =
    pathname.startsWith('/recruiter') &&
    !RECRUITER_AUTH_ROUTES.some(r => pathname === r);

  const isRecruiterAuthRoute = RECRUITER_AUTH_ROUTES.some(r => pathname === r);

  if (isRecruiterProtected && !isRecruiterAuth) {
    const url = new URL('/recruiter/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isRecruiterAuthRoute && isRecruiterAuth) {
    return NextResponse.redirect(new URL('/recruiter/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
};
