// ── Date & time ──────────────────────────────────────────────────────────────

/**
 * Format an ISO date string as a human-readable date.
 * @example formatDate('2024-05-19') → 'May 19, 2024'
 */
export function formatDate(
  iso: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
  if (!iso) return '';
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', options);
}

/**
 * Format an ISO date string as a short date.
 * @example formatDateShort('2024-05-19') → '19 May 2024'
 */
export function formatDateShort(iso: string | Date | null | undefined): string {
  return formatDate(iso, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Return a relative time string from an ISO timestamp.
 * @example relativeTime('2024-05-19T10:00:00Z') → '3h ago'
 */
export function relativeTime(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'Just now';
  const mins = Math.floor(ms / 60_000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ── Salary ───────────────────────────────────────────────────────────────────

/**
 * Format a salary range in LPA (Lakhs Per Annum).
 * @example formatSalary(8, 12) → '₹8 – ₹12 LPA'
 * @example formatSalary(8, 12, true) → '₹8L – ₹12L'
 */
export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  compact = false
): string {
  if (min == null && max == null) return 'Not disclosed';
  const fmt = (n: number) =>
    compact ? `₹${n}L` : `₹${n} LPA`;
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

/**
 * Format a salary range from string values (backend may return strings).
 */
export function formatSalaryFromStrings(
  min: string | number | null | undefined,
  max: string | number | null | undefined,
  compact = false
): string {
  const n = (v: string | number | null | undefined) =>
    v == null || v === '' ? null : Number(v);
  return formatSalary(n(min), n(max), compact);
}

// ── Location ─────────────────────────────────────────────────────────────────

/**
 * Format a location string, with optional work mode suffix.
 * @example formatLocation('Bengaluru', 'remote') → 'Bengaluru · Remote'
 * @example formatLocation(null, 'remote') → 'Remote'
 */
export function formatLocation(
  city: string | null | undefined,
  workMode?: string | null
): string {
  const modeLabel = workMode
    ? workMode.charAt(0).toUpperCase() + workMode.slice(1).toLowerCase()
    : null;

  if (!city && !modeLabel) return '';
  if (!city) return modeLabel!;
  if (!modeLabel || modeLabel.toLowerCase() === 'onsite') return city;
  return `${city} · ${modeLabel}`;
}

// ── Text ─────────────────────────────────────────────────────────────────────

/**
 * Truncate text to a maximum number of characters, appending '…'.
 * @example truncateText('Hello world', 8) → 'Hello wo…'
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Generate initials from a full name (up to 2 characters).
 * @example getInitials('Neelam Sharma') → 'NS'
 * @example getInitials('Alice') → 'AL'
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Numbers ──────────────────────────────────────────────────────────────────

/**
 * Format a count with a unit, collapsing to 'k' at ≥ 1000.
 * @example formatCount(1234) → '1.2k'
 * @example formatCount(42) → '42'
 */
export function formatCount(n: number | null | undefined): string {
  if (n == null) return '0';
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/**
 * Pluralise a word based on count.
 * @example pluralise(1, 'applicant') → '1 applicant'
 * @example pluralise(5, 'applicant') → '5 applicants'
 */
export function pluralise(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? singular + 's')}`;
}

/**
 * Return a day-granularity relative date string.
 * @example relativeDate('2024-05-18T00:00:00Z') → '1 day ago'
 */
export function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 14) return '1 week ago';
  return `${Math.floor(diff / 7)} weeks ago`;
}

// ── Color hashing ─────────────────────────────────────────────────────────────

export const AVATAR_COLOR_CLASSES = [
  'bg-blue-600', 'bg-green-600', 'bg-indigo-600', 'bg-violet-600',
  'bg-orange-500', 'bg-teal-600', 'bg-red-600', 'bg-pink-600',
];

/**
 * Hash a string to a deterministic Tailwind bg-color class.
 */
export function hashColor(str: string, classes = AVATAR_COLOR_CLASSES): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return classes[h % classes.length];
}

// ── Salary (LPA) ─────────────────────────────────────────────────────────────

export function formatLpa(val: string | number): string {
  const n = parseFloat(String(val));
  if (isNaN(n)) return '0';
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
}

export function salaryLabel(lpaMin: string, lpaMax: string): string {
  const min = parseFloat(lpaMin);
  const max = parseFloat(lpaMax);
  if (min === 0 && max === 0) return '0 LPA';
  return `${formatLpa(min)}–${formatLpa(max)} LPA`;
}
