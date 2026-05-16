/**
 * Hydration-safe utilities for accessing browser APIs
 * These ensure that all browser-specific code runs only on the client after hydration
 */

/**
 * Safely get a value from localStorage.
 * Returns null if localStorage is not available (SSR, hydration mismatch).
 */
export function safeLocalStorageGetItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely set a value in localStorage.
 * No-op if localStorage is not available.
 */
export function safeLocalStorageSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail (quota exceeded, private browsing, etc)
  }
}

/**
 * Safely remove a value from localStorage.
 * No-op if localStorage is not available.
 */
export function safeLocalStorageRemoveItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

/**
 * Safely dispatch a custom event.
 * No-op if window is not available.
 */
export function safeDispatchEvent(eventName: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new Event(eventName));
}

/**
 * Safely add an event listener.
 * Returns a cleanup function.
 */
export function safeAddEventListener(
  eventName: string,
  handler: EventListener
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}
