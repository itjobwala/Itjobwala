/**
 * Zustand Hydration Utilities
 *
 * Helps coordinate hydration across multiple Zustand stores.
 * Useful when auth state lives in Zustand with persist enabled.
 *
 * Pattern:
 * ```typescript
 * // In auth store
 * const useAuthStore = create<AuthStore>((set) => ({
 *   // ...
 * }), {
 *   name: 'auth-store',
 *   version: 1,
 * });
 *
 * // In component
 * const { isHydrated } = useAuthHydration({
 *   isExternalHydrated: () => useAuthStore.persist?.hasHydrated?.() ?? false
 * });
 * ```
 */

/**
 * Check if a Zustand store has completed hydration
 *
 * Works with stores created using:
 * create<State>((set) => {...}, {
 *   name: 'store-name',
 *   ...other config
 * })
 *
 * The persist middleware adds a _hasHydrated flag after rehydration.
 */
export function isZustandStoreHydrated<T extends { _hasHydrated?: boolean }>(
  store: any
): boolean {
  try {
    // For Zustand v4+, check persist.hasHydrated
    if (typeof store === 'object' && store !== null) {
      // Try the new pattern
      if (store.persist?.hasHydrated?.() === true) {
        return true;
      }

      // Try getting state directly
      const state = typeof store.getState === 'function' ? store.getState() : store;
      if (typeof state === 'object' && state?._hasHydrated === true) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Wait for multiple Zustand stores to hydrate
 *
 * Usage:
 * ```typescript
 * await waitForZustandHydration([useAuthStore, useSettingsStore]);
 * ```
 */
export function waitForZustandHydration(
  stores: any[],
  maxWaitMs: number = 5000
): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkHydration = () => {
      // Check if all stores are hydrated
      const allHydrated = stores.every((store) =>
        isZustandStoreHydrated(store)
      );

      if (allHydrated) {
        resolve(true);
        return;
      }

      // Check timeout
      if (Date.now() - startTime > maxWaitMs) {
        console.warn(
          '[Zustand] Hydration timeout after',
          maxWaitMs,
          'ms. Proceeding anyway.'
        );
        resolve(false);
        return;
      }

      // Poll again in 10ms
      requestAnimationFrame(checkHydration);
    };

    checkHydration();
  });
}

/**
 * Create a hydration-aware hook factory
 *
 * Usage:
 * ```typescript
 * export const useAuthStore = create<AuthState>(
 *   (set) => ({...}),
 *   {
 *     name: 'auth',
 *     version: 1,
 *     // ... persist config
 *   }
 * );
 *
 * export const useAuthHydrationAware = createZustandHydrationHook(useAuthStore);
 * ```
 */
export function createZustandHydrationHook<T extends object>(store: any) {
  return function useZustandHydrationAware(selector?: (state: T) => any) {
    const state = store(selector);
    const isHydrated = isZustandStoreHydrated(store);

    return {
      data: state,
      isHydrated,
    };
  };
}
