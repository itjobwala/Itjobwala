'use client';

import { useState, useEffect, useRef } from 'react';
import { suggestSkills } from '@/src/lib/skillValidation';
import { fetchSkillSuggestions } from '@/src/lib/api/skills';

/**
 * Returns skill name suggestions for the given input string.
 * - Shows instant static-list results first (no flicker)
 * - Replaces with API results after 300ms debounce
 * - Falls back to static list silently if the API call fails
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

    // Instant static results so there's no empty flash
    setSuggestions(suggestSkills(q, excludeRef.current));

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
        // keep static suggestions — API unavailable
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

  return suggestions;
}
