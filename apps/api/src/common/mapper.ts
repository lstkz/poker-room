import * as R from 'remeda';
import { Table } from 'shared';
import { TableModel } from '../collections/Table';
import { UserModel } from '../collections/User';
import { renameId } from './helper';

export function mapTable(
  table: TableModel,
  userMap: Record<string, UserModel>
): Table {
  return {
    ...renameId(table),
    players: table.players
      .map(player => {
        const id = player.userId.toHexString();
        return {
          user: {
            id,
            username: userMap[id].username,
          },
          ...R.pick(player, ['money', 'seat']),
        };
      })
      .sort((a, b) => a.seat - b.seat),
  };
}
