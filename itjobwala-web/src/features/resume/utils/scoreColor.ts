import type { BandColor } from '../types/resume.types';

export function getScoreColor(score: number): BandColor {
  if (score >= 90) return 'emerald';
  if (score >= 76) return 'green';
  if (score >= 61) return 'blue';
  if (score >= 41) return 'amber';
  return 'red';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 76) return 'Great';
  if (score >= 61) return 'Good';
  if (score >= 41) return 'Fair';
  return 'Needs Work';
}

/** Tailwind color classes keyed by BandColor */
export const BAND_COLORS: Record<BandColor, { ring: string; text: string; bg: string; fill: string; bar: string }> = {
  emerald: {
    ring: 'stroke-emerald-500',
    text: 'text-emerald-600',
    bg:   'bg-emerald-50',
    fill: 'fill-emerald-500',
    bar:  'bg-emerald-500',
  },
  green: {
    ring: 'stroke-green-500',
    text: 'text-green-600',
    bg:   'bg-green-50',
    fill: 'fill-green-500',
    bar:  'bg-green-500',
  },
  blue: {
    ring: 'stroke-blue-500',
    text: 'text-blue-600',
    bg:   'bg-blue-50',
    fill: 'fill-blue-500',
    bar:  'bg-blue-500',
  },
  amber: {
    ring: 'stroke-amber-500',
    text: 'text-amber-600',
    bg:   'bg-amber-50',
    fill: 'fill-amber-500',
    bar:  'bg-amber-500',
  },
  orange: {
    ring: 'stroke-orange-500',
    text: 'text-orange-600',
    bg:   'bg-orange-50',
    fill: 'fill-orange-500',
    bar:  'bg-orange-500',
  },
  red: {
    ring: 'stroke-red-400',
    text: 'text-red-500',
    bg:   'bg-red-50',
    fill: 'fill-red-400',
    bar:  'bg-red-400',
  },
};

export const SECTION_LABELS: Record<string, string> = {
  contact_info:    'Contact Info',
  skills:          'Skills',
  experience:      'Experience',
  education:       'Education',
  projects:        'Projects',
  certifications:  'Certifications',
  summary:         'Summary',
  readability:     'Readability',
  keyword_density: 'Keyword Density',
};
