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
      console.log('auth', socket.id);
      const tokenEntity = await AccessTokenCollection.findOne({
        _id: socket.handshake.query.accessToken,
      });
      if (!tokenEntity) {
        return next(new Error('authentication error'));
      }
      console.log({ tokenEntity });
      socketUserIdMap[socket.id] = tokenEntity.userId;
      console.log(socketUserIdMap);
      next();
    } catch (e) {
      return next(e);
    }
  });

  io.on('connect', socket => {
    console.log('connect', socket.id);
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
      console.log('join-table', userTableMap);
    });
    socket.on('leave-table', data => {
      _removeArrayItem(userTableMap[data.id], socket);
    });
  });
}
