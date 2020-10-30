import { ObjectID } from 'mongodb';
import { S } from 'schema';
import { Table } from 'shared';
import { TableCollection } from '../../collections/Table';
import { UserCollection } from '../../collections/User';
import { BadRequestError, TableNotFoundError } from '../../common/errors';
import { withTransaction } from '../../db';
import { dispatch } from '../../events/dispatch';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';
import { getTableById } from './getTableById';

export const leaveTable = createContract('table.leaveTable')
  .params('user', 'values')
  .schema({
    user: S.object().as<AppUser>(),
    values: S.object().keys({
      tableId: S.string().objectId(),
    }),
  })
  .returns<Table>()
  .fn(async (user, values) => {
    await withTransaction(async () => {
      const [latestUser, table] = await Promise.all([
        UserCollection.findOneOrThrow({
          _id: ObjectID.createFromHexString(user.id),
        }),
        TableCollection.findOne({
          _id: ObjectID.createFromHexString(values.tableId),
        }),
      ]);
      if (!table) {
        throw new TableNotFoundError();
      }
      const player = table.players.find(x => x.userId.equals(latestUser._id));
      if (!player) {
        throw new BadRequestError('Not joined');
      }
      table.players = table.players.filter(
        x => !x.userId.equals(latestUser._id)
      );
      latestUser.bankroll += player.money;
      await Promise.all([
        UserCollection.update(latestUser, ['bankroll']),
        TableCollection.update(table, ['players']),
      ]);
    });
    dispatch({
      type: 'PLAYER_LEFT',
      payload: {
        tableId: values.tableId,
        userId: user.id,
      },
    });
    return getTableById(values.tableId);
  });

export const leaveTableRpc = createRpcBinding({
  injectUser: true,
  signature: 'table.leaveTable',
  handler: leaveTable,
});
