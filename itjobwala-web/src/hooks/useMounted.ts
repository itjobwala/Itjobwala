import { useEffect, useState } from 'react';

/**
 * Hook that returns true only after component mounts on client.
 * Prevents SSR/client render mismatch by ensuring server and client
 * render the same initial content.
 */
export function useMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
