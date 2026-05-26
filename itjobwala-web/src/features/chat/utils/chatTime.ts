export function formatChatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now   = new Date();
  const diff  = now.getTime() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days < 7)  return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

export function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now   = new Date();
  const diff  = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
