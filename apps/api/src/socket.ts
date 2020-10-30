import http from 'http';
import SocketIO from 'socket.io';
import { AccessTokenCollection } from './collections/AccessToken';

let io: SocketIO.Server | null = null;

export const userSocketMap: Record<string, Array<SocketIO.Socket>> = {};
export const userTableMap: Record<string, Array<SocketIO.Socket>> = {};
export const socketUserIdMap: Record<string, string> = {};

export function getIO() {
  if (!io) {
    throw new Error('IO not set');
  }
  return io;
}

function _removeArrayItem<T>(items: T[], item: T) {
  if (!items) {
    return;
  }
  const idx = items.indexOf(item);
  if (idx !== -1) {
    items.splice(items.indexOf(item), 1);
  }
}

export function initSocket(server: http.Server) {
  io = SocketIO(server);

  io.use(async (socket, next) => {
    try {
      const tokenEntity = await AccessTokenCollection.findOne({
        _id: socket.handshake.query.accessToken,
      });
      if (!tokenEntity) {
        return next(new Error('authentication error'));
      }
      socketUserIdMap[socket.id] = tokenEntity.userId;
      next();
    } catch (e) {
      return next(e);
    }
  });

  io.on('connect', socket => {
    const userId = socketUserIdMap[socket.id];
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    const sockets = userSocketMap[userId];
    sockets.push(socket);
    socket.on('disconnect', () => {
      _removeArrayItem(sockets, socket);
      Object.values(userTableMap).forEach(arr => {
        _removeArrayItem(arr, socket);
      });
    });

    socket.on('join-table', data => {
      if (!userTableMap[data.id]) {
        userTableMap[data.id] = [];
      }
      userTableMap[data.id].push(socket);
    });
    socket.on('leave-table', data => {
      _removeArrayItem(userTableMap[data.id], socket);
    });
  });
}
