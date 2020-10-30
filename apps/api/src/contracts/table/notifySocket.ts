import { createEventBinding } from '../../lib';
import { socketUserIdMap, userTableMap } from '../../socket';
import { getCurrentGameForUser } from '../game/getCurrentGame';
import { getTableById } from './getTableById';

async function _sendUpdates(tableId: string) {
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
}

export const joinTableEvent = createEventBinding({
  type: 'PLAYER_JOINED',
  handler: async payload => {
    const { tableId } = payload;
    await _sendUpdates(tableId);
  },
});

export const leaveTableEvent = createEventBinding({
  type: 'PLAYER_LEFT',
  handler: async payload => {
    const { tableId } = payload;
    await _sendUpdates(tableId);
  },
});

export const gameUpdatedEvent = createEventBinding({
  type: 'GAME_UPDATED',
  handler: async payload => {
    const { tableId } = payload;
    await _sendUpdates(tableId);
  },
});
