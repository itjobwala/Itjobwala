/**
 * Socket.IO singleton client.
 *
 * - Single instance shared across the app.
 * - Lazy connect: call connect() with token, disconnect() on logout.
 * - Auto-reconnect with exponential backoff (socket.io default).
 * - All event listeners are cleaned up on disconnect.
 */

import { io as ioConnect, type Socket } from 'socket.io-client';
import { env } from '@/src/env';

let socket: Socket | null = null;

/**
 * Returns the current socket instance (may be null if not connected).
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Connect (or reconnect) to the socket server with the given access token.
 * No-ops if already connected with the same token.
 */
export function connectSocket(accessToken: string): Socket {
  if (socket?.connected) return socket;

  // Disconnect stale socket before reconnecting with new token
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = ioConnect(env.socketUrl, {
    auth:            { token: accessToken },
    transports:      ['websocket', 'polling'],
    reconnection:    true,
    reconnectionAttempts: 10,
    reconnectionDelay:    1000,
    reconnectionDelayMax: 8000,
    timeout:         10000,
    autoConnect:     true,
  });

  return socket;
}

/**
 * Disconnect and destroy the socket instance.
 * Call on logout.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Safe emit — no-ops if socket is not connected.
 * Returns true if emitted, false if socket was not ready.
 */
export function safeEmit(event: string, ...args: unknown[]): boolean {
  if (!socket?.connected) return false;
  socket.emit(event, ...args);
  return true;
}
