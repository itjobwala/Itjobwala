import { useRef, useEffect, type RefObject } from 'react';

const SELECTOR = '.reveal,.reveal-left,.reveal-right';

export function useReveal(threshold = 0.15): RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold },
    );

    const observeTarget = (target: Element) => {
      if (!target.classList.contains('visible')) obs.observe(target);
    };

    // Observe elements already in DOM
    el.querySelectorAll<Element>(SELECTOR).forEach(observeTarget);

    // Watch for elements added after initial render (e.g. after API response)
    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) observeTarget(node);
          node.querySelectorAll<Element>(SELECTOR).forEach(observeTarget);
        });
      });
    });

    mutObs.observe(el, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      mutObs.disconnect();
    };
  }, [threshold]);

  return ref;
}
