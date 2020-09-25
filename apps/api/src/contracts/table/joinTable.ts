import { ClientSession, ObjectID } from 'mongodb';
import { S } from 'schema';
import { Table } from 'shared';
import {
  GameCollection,
  GameModel,
  GamePlayerInfo,
} from '../../collections/Game';
import { TableCollection } from '../../collections/Table';
import { UserCollection } from '../../collections/User';
import { CardRandomizer, getBB } from '../../common/engine';
import { BadRequestError, TableNotFoundError } from '../../common/errors';
import { randomItem } from '../../common/helper';
import { MIN_ENTRY_PERCENT } from '../../config';
import { startSession } from '../../db';
import { dispatch } from '../../events/dispatch';
import {
  createContract,
  createEventBinding,
  createRpcBinding,
} from '../../lib';
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
    dispatch({
      type: 'PLAYER_JOINED',
      payload: {
        tableId: values.tableId,
        userId: user.id,
      },
    });
    return getTableById(values.tableId);
  });

export const joinTableRpc = createRpcBinding({
  injectUser: true,
  signature: 'table.joinTable',
  handler: joinTable,
});

export const joinTableEvent = createEventBinding({
  type: 'PLAYER_JOINED',
  handler: async payload => {
    let session: ClientSession = null!;
    try {
      session = await startSession();
      await session.withTransaction(async () => {
        const table = await TableCollection.findOneOrThrow({
          _id: ObjectID.createFromHexString(payload.tableId),
        });
        if (table.gameId || table.players.length < 3) {
          return;
        }
        const cr = new CardRandomizer();
        const players = await Promise.all(
          table.players
            .sort((a, b) => a.seat - b.seat)
            .map(async player => {
              const mapped: GamePlayerInfo = {
                userId: player.userId,
                hand: [await cr.randomNextCard(), await cr.randomNextCard()],
                seat: player.seat,
                money: player.money,
              };
              return mapped;
            })
        );
        const bb = getBB(table.stakes);
        const gameValues: Omit<GameModel, '_id'> = {
          isDone: true,
          tableId: table._id,
          pot: 0,
          stakes: table.stakes,
          currentBets: [bb],
          players,
          phases: [{ type: 'pre-flop', moves: [], cards: [] }],
          dealerPosition: (await randomItem(table.players)).seat,
          betMap: {},
        };

        const dealerPlayer = players.findIndex(
          x => x.seat === gameValues.dealerPosition
        );
        const sbPlayer = players[(dealerPlayer + 1) % players.length];
        const bbPlayer = players[(dealerPlayer + 2) % players.length];
        sbPlayer.money -= bb / 2;
        bbPlayer.money -= bb;
        gameValues.betMap[sbPlayer.userId.toHexString()] = bb / 2;
        gameValues.betMap[bbPlayer.userId.toHexString()] = bb;

        const gameInsert = await GameCollection.insertOne(gameValues);
        table.gameId = gameInsert.insertedId;
        await TableCollection.update(table, ['gameId']);
        dispatch({
          type: 'GAME_STARTED',
          payload: {
            tableId: payload.tableId,
            gameId: gameInsert.insertedId.toHexString(),
          },
        });
      });
    } finally {
      await session.endSession();
    }
  },
});
