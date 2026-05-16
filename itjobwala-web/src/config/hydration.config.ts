/**
 * Hydration Configuration
 *
 * Production-grade settings for navbar hydration, auth state loading,
 * and SSR/CSR coordination.
 *
 * Customize these settings based on your specific needs:
 * - Auth store location
 * - Hydration timing
 * - SSR strategy
 * - Performance targets
 */

/**
 * Navbar Hydration Strategy
 *
 * 'skeleton' (default):
 * - Shows NavbarSkeleton during hydration
 * - Smooth transition to real navbar
 * - Prevents auth flicker
 * - Zero CLS (Cumulative Layout Shift)
 *
 * 'dynamic':
 * - Only loads AuthNavbar when authenticated
 * - Reduces initial JS bundle for unauthenticated users
 * - Enable: NEXT_PUBLIC_DISABLE_AUTH_NAVBAR_SSR=true
 * - Best for: Performance-critical apps, SSG pages
 *
 * 'hybrid':
 * - Default: normal rendering
 * - Option to enable 'dynamic' per-page via env
 * - Most flexible approach
 */
export const NAVBAR_HYDRATION_STRATEGY = 'hybrid' as const;

/**
 * Auth Hydration Timing
 *
 * Delay (ms) before considering auth hydration complete.
 * Useful for:
 * - Waiting for Zustand persist
 * - Syncing with other async operations
 * - Smoother transitions
 *
 * Recommendations:
 * - 0: Immediate (fastest, modern browsers)
 * - 50-100: Small delay for store coordination
 * - 200+: Only if coordinating many stores
 */
export const AUTH_HYDRATION_DELAY = 0;

/**
 * Enable Zustand Persist Detection
 *
 * If using Zustand stores with persist:
 * - Hook will detect when stores are hydrated
 * - Prevents rendering stale auth state
 * - Waits for all stores before finalizing hydration
 */
export const ENABLE_ZUSTAND_DETECTION = false;

/**
 * SSR Strategy for Auth Navbar
 *
 * false (default):
 * - AuthNavbar rendered during SSR
 * - Full navbar HTML in initial response
 * - Better initial paint
 * - Best for: SEO, content-heavy pages
 *
 * true:
 * - AuthNavbar skipped during SSR (client-only)
 * - Smaller initial HTML
 * - Dynamic loading after hydration
 * - Best for: User dashboard, performance targets
 *
 * Can override via env: NEXT_PUBLIC_DISABLE_AUTH_NAVBAR_SSR=true
 */
export const DISABLE_AUTH_NAVBAR_SSR = process.env.NEXT_PUBLIC_DISABLE_AUTH_NAVBAR_SSR === 'true';

/**
 * Navbar Fallback Component
 *
 * Component shown while hydration is in progress:
 * - NavbarSkeleton: lightweight, animated placeholders
 * - Custom: your own fallback component
 *
 * Requirements:
 * - Same height (68px) to prevent layout shift
 * - No hydration errors
 * - Lightweight (minimal JS)
 * - Matches navbar styling theme
 */
export const NAVBAR_FALLBACK = 'NavbarSkeleton' as const;

/**
 * Performance Budget
 *
 * Recommended hydration timings (in ms):
 * - Skeleton shown: < 16ms (1 frame)
 * - Auth checked: < 50ms
 * - Navbar rendered: < 100ms
 * - Total hydration: < 200ms
 *
 * Monitor these with Web Vitals:
 * - TTI (Time to Interactive)
 * - FCP (First Contentful Paint)
 * - CLS (Cumulative Layout Shift) - should be 0
 */
export const PERFORMANCE_BUDGET = {
  skeletonShowMs: 16,
  authCheckMs: 50,
  navbarRenderMs: 100,
  totalHydrationMs: 200,
};

/**
 * Debug Settings
 *
 * Enable detailed logging for hydration issues:
 * - Auth state changes
 * - Hydration timing
 * - Store coordination
 * - Network requests
 */
export const HYDRATION_DEBUG = process.env.NODE_ENV === 'development';

/**
 * Feature Flags
 *
 * Optional features for extended functionality:
 * - Progressive auth loading
 * - Prefetch auth state
 * - Cache busting strategies
 */
export const FEATURES = {
  /**
   * Prefetch auth state from localStorage immediately
   * (without waiting for useEffect)
   *
   * Trade-off: May cause hydration error if not careful
   * Benefit: Faster auth detection
   */
  PREFETCH_AUTH_STATE: false,

  /**
   * Show detailed error messages during hydration issues
   * (development only)
   */
  VERBOSE_ERRORS: process.env.NODE_ENV === 'development',

  /**
   * Log hydration timeline
   * (helps identify bottlenecks)
   */
  LOG_TIMELINE: process.env.NODE_ENV === 'development',
};
