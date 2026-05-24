'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchSkillSuggestions } from '@/features/jobs/shared';

/**
 * Returns skill name suggestions from the backend for the given input.
 * Results are debounced (300ms) to avoid hammering the API on every keystroke.
 */
export function useSkillSuggestions(input: string, exclude: string[]): string[] {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const excludeRef = useRef(exclude);
  excludeRef.current = exclude;

  useEffect(() => {
    const q = input.trim();

    if (!q) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await fetchSkillSuggestions(q, 8);
        const excludeSet = new Set(excludeRef.current.map(s => s.toLowerCase()));
        setSuggestions(
          results
            .map(s => s.name)
            .filter(name => !excludeSet.has(name.toLowerCase())),
        );
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

  return suggestions;
}
