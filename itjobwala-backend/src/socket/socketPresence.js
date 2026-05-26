/**
 * In-memory presence tracking.
 * Never persisted — presence is inherently ephemeral.
 *
 * Structure:
 *   onlineUsers: Map<userId, { socketIds: Set<string>, lastSeen: Date }>
 */

const onlineUsers = new Map();

export function markOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, { socketIds: new Set(), lastSeen: new Date() });
  }
  const entry = onlineUsers.get(userId);
  entry.socketIds.add(socketId);
  entry.lastSeen = new Date();
}

export function markOffline(userId, socketId) {
  const entry = onlineUsers.get(userId);
  if (!entry) return;

  entry.socketIds.delete(socketId);
  entry.lastSeen = new Date();

  // Only fully remove when no sockets remain (multi-tab support)
  if (entry.socketIds.size === 0) {
    onlineUsers.delete(userId);
  }
}

export function isOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).socketIds.size > 0;
}

export function getLastSeen(userId) {
  return onlineUsers.get(userId)?.lastSeen ?? null;
}

export function getOnlineUserIds() {
  return [...onlineUsers.keys()];
}
