import { EVENTS }        from '../constants.js';
import { assertConversationAccess } from '../socketRooms.js';
import { emitTypingStart, emitTypingStop } from '../socketEmitters.js';

// Per-socket typing timers to auto-stop after 4 seconds of inactivity
const typingTimers = new Map();

export function registerTypingEvents(io, socket) {

  socket.on(EVENTS.TYPING_START, async ({ conversation_id }) => {
    try {
      if (!conversation_id) return;
      const conv = await assertConversationAccess(socket, conversation_id);
      if (!conv) return;

      const timerKey = `${socket.id}:${conversation_id}`;

      // Clear existing auto-stop timer
      if (typingTimers.has(timerKey)) {
        clearTimeout(typingTimers.get(timerKey));
      }

      // Broadcast to room (socket.to excludes the sender themselves)
      socket.to(`conversation:${conversation_id}`).emit(EVENTS.TYPING_START, {
        conversation_id,
        user_id: socket.user.id,
      });

      // Auto-stop after 4 s if client doesn't send typing:stop
      typingTimers.set(timerKey, setTimeout(() => {
        socket.to(`conversation:${conversation_id}`).emit(EVENTS.TYPING_STOP, {
          conversation_id,
          user_id: socket.user.id,
        });
        typingTimers.delete(timerKey);
      }, 4000));
    } catch {
      // Typing is non-critical, swallow errors
    }
  });

  socket.on(EVENTS.TYPING_STOP, ({ conversation_id }) => {
    const timerKey = `${socket.id}:${conversation_id}`;
    if (typingTimers.has(timerKey)) {
      clearTimeout(typingTimers.get(timerKey));
      typingTimers.delete(timerKey);
    }
    socket.to(`conversation:${conversation_id}`).emit(EVENTS.TYPING_STOP, {
      conversation_id,
      user_id: socket.user.id,
    });
  });

  // Clean up all typing timers when socket disconnects
  socket.on(EVENTS.DISCONNECT, () => {
    for (const [key, timer] of typingTimers.entries()) {
      if (key.startsWith(socket.id)) {
        clearTimeout(timer);
        typingTimers.delete(key);
      }
    }
  });
}
