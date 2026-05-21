'use client';

/**
 * NavbarSkeleton - Stable placeholder during hydration
 *
 * Prevents layout shift and auth flicker by rendering a skeleton with:
 * - Same height as real navbar (h-[68px])
 * - Same layout structure
 * - Animated placeholder elements
 *
 * Shown during:
 * - Server to client hydration
 * - Auth state loading
 * - Zustand persist hydration
 */
export default function NavbarSkeleton() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[200] border-b border-black/[0.06] transition-all duration-[350ms] bg-white/[0.85] backdrop-blur-[14px]"
      suppressHydrationWarning
    >
      <div
        className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center h-[68px] gap-9"
        suppressHydrationWarning
      >
        {/* Logo skeleton */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse" />
          <div className="w-24 h-5 bg-gray-200 rounded-md animate-pulse" />
        </div>

        {/* Nav links skeleton — desktop only */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Right controls skeleton */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Search skeleton — desktop */}
          <div className="hidden lg:block h-9 w-40 bg-gray-200 rounded-xl animate-pulse" />

          {/* Divider */}
          <div className="hidden lg:block w-px h-5 bg-gray-200" />

          {/* Notification/Message skeleton */}
          <div className="hidden sm:flex gap-2">
            <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse" />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-gray-200 mx-1" />

          {/* User dropdown skeleton — desktop */}
          <div className="hidden sm:block h-9 w-9 rounded-full bg-gray-200 animate-pulse" />

          {/* Hamburger skeleton — mobile */}
          <div className="sm:hidden h-9 w-9 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>
    </nav>
  );
}
