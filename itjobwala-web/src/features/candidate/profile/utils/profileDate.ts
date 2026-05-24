export function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export function getYear(dateStr?: string | null, yearNum?: number | null): string {
  if (dateStr) return dateStr.slice(0, 4);
  if (yearNum != null) return String(yearNum);
  return '';
}
