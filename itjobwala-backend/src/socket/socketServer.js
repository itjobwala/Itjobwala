import { Server }    from 'socket.io';
import { env }        from '../config/env.js';
import { socketAuthMiddleware } from './socketAuth.js';
import { joinUserRooms }        from './socketRooms.js';
import { registerMessageEvents }      from './events/message.events.js';
import { registerTypingEvents }       from './events/typing.events.js';
import { registerConversationEvents } from './events/conversation.events.js';
import { registerPresenceEvents }     from './events/presence.events.js';

let _io = null;

/**
 * Initialize Socket.IO and attach to the given HTTP server.
 * Must be called once after Fastify starts listening.
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
export function initSocketServer(httpServer, logger) {
  _io = new Server(httpServer, {
    cors: {
      origin:      env.corsOrigins,
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    // Prefer WebSocket — fall back to polling
    transports:       ['websocket', 'polling'],
    pingTimeout:      20000,
    pingInterval:     25000,
    connectTimeout:   10000,
    maxHttpBufferSize: 1e6, // 1 MB max message payload
  });

  // ── Auth middleware (runs before connection) ─────────────────────────────
  _io.use(socketAuthMiddleware);

  // ── Connection handler ───────────────────────────────────────────────────
  _io.on('connection', async (socket) => {
    logger?.info({ userId: socket.user?.id, role: socket.user?.role }, 'Socket connected');

    // Join personal + active conversation rooms
    await joinUserRooms(socket);

    // Register modular event handlers
    registerPresenceEvents(_io, socket);
    registerConversationEvents(_io, socket);
    registerMessageEvents(_io, socket);
    registerTypingEvents(_io, socket);

    socket.on('disconnect', (reason) => {
      logger?.info({ userId: socket.user?.id, reason }, 'Socket disconnected');
    });

    socket.on('error', (err) => {
      logger?.error({ userId: socket.user?.id, err }, 'Socket error');
    });
  });

  logger?.info('Socket.IO server initialized');
  return _io;
}

/**
 * Get the initialized io instance.
 * Returns null before initSocketServer() is called.
 */
export function getIo() {
  return _io;
}
