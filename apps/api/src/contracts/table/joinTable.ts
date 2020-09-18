import { ClientSession, ObjectID } from 'mongodb';
import { S } from 'schema';
import { Table } from 'shared';
import { TableCollection } from '../../collections/Table';
import { UserCollection } from '../../collections/User';
import { BadRequestError, TableNotFoundError } from '../../common/errors';
import { MIN_ENTRY_PERCENT } from '../../config';
import { startSession } from '../../db';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';
import { getTableById } from './getTableById';

export const joinTable = createContract('table.joinTable')
  .params('user', 'values')
  .schema({
    user: S.object().as<AppUser>(),
    values: S.object().keys({
      tableId: S.string().objectId(),
      money: S.number().min(0.01),
      seat: S.number().min(1),
    }),
  })
  .returns<Table>()
  .fn(async (user, values) => {
    let session: ClientSession = null!;
    try {
      session = await startSession();
      await session.withTransaction(async () => {
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
        if (values.seat > table.maxSeats) {
          throw new BadRequestError('Invalid seat');
        }
        if (table.players.some(x => x.seat === values.seat)) {
          throw new BadRequestError('Seat already taken by another player');
        }
        if (table.players.some(x => x.userId.equals(latestUser._id))) {
          throw new BadRequestError('Already joined');
        }
        if (latestUser.bankroll < values.money) {
          throw new BadRequestError('Not enough money');
        }
        if (values.money < table.stakes * MIN_ENTRY_PERCENT) {
          throw new BadRequestError(
            `Min entry: ${table.stakes * MIN_ENTRY_PERCENT}$`
          );
        }
        if (values.money > table.stakes) {
          throw new BadRequestError(`Max entry: ${table.stakes}$`);
        }

        latestUser.bankroll -= values.money;
        table.players.push({
          money: values.money,
          seat: values.seat,
          userId: latestUser._id,
        });
        await Promise.all([
          UserCollection.update(latestUser, ['bankroll']),
          TableCollection.update(table, ['players']),
        ]);
      });
    } finally {
      await session.endSession();
    }
    return getTableById(values.tableId);
  });

export const joinTableRpc = createRpcBinding({
  injectUser: true,
  signature: 'table.joinTable',
  handler: joinTable,
});
