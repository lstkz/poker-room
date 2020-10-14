import { createEventBinding } from '../../lib';
import { socketUserIdMap, userTableMap } from '../../socket';
import { getCurrentGameForUser } from '../game/getCurrentGame';
import { getTableById } from './getTableById';

export const joinTableEvent = createEventBinding({
  type: 'PLAYER_JOINED',
  handler: async payload => {
    const { tableId } = payload;
    const connectedSockets = userTableMap[tableId] ?? [];
    const table = await getTableById(tableId);
    await Promise.all(
      connectedSockets.map(async socket => {
        const userId = socketUserIdMap[socket.id];
        const game = await getCurrentGameForUser(userId, tableId);
        socket.emit('update', {
          game,
          table,
        });
      })
    );
  },
});
