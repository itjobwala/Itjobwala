import { EVENTS }         from '../constants.js';
import { markOnline, markOffline, isOnline } from '../socketPresence.js';

export function registerPresenceEvents(io, socket) {
  const { id: userId } = socket.user;

  markOnline(userId, socket.id);

  // Broadcast online status to the whole namespace (other connected users)
  socket.broadcast.emit(EVENTS.USER_ONLINE, {
    user_id:   userId,
    timestamp: new Date().toISOString(),
  });

  socket.on(EVENTS.DISCONNECT, () => {
    markOffline(userId, socket.id);

    // Only broadcast offline if no other sockets remain (multi-tab)
    if (!isOnline(userId)) {
      socket.broadcast.emit(EVENTS.USER_OFFLINE, {
        user_id:   userId,
        last_seen: new Date().toISOString(),
      });
    }
  });
}
