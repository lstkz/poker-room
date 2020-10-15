import SocketIO from 'socket.io-client';
import { getAccessToken } from './Storage';

let socket: SocketIOClient.Socket | null = null;

export function getSocket() {
  if (!socket) {
    throw new Error('Not initialized');
  }
  return socket;
}

export function initSocket() {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {}
  }
  socket = SocketIO({
    query: {
      accessToken: getAccessToken(),
    },
  });
  return socket;
}
