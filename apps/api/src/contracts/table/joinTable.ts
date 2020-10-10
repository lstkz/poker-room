import { ObjectID } from 'mongodb';
import { S } from 'schema';
import { Table } from 'shared';
import { GameCollection, GamePlayerInfo } from '../../collections/Game';
import { TableCollection } from '../../collections/Table';
import { UserCollection } from '../../collections/User';
import { CardRandomizer, getBB } from '../../common/engine';
import { BadRequestError, TableNotFoundError } from '../../common/errors';
import {
  getBlindPlayer,
  randomItem,
  safeAssign,
  safeKeys,
} from '../../common/helper';
import { MIN_ENTRY_PERCENT } from '../../config';
import { withTransaction } from '../../db';
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
    await withTransaction(async () => {
      const table = await TableCollection.findOneOrThrow({
        _id: ObjectID.createFromHexString(payload.tableId),
      });
      const game = await GameCollection.findOneOrThrow({
        _id: table.gameId,
      });
      if (game.isStarted || table.players.length < 3) {
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
      const dealerPosition = (await randomItem(table.players)).seat;
      const { sbPlayer, bbPlayer } = getBlindPlayer(players, dealerPosition);
      const updateValue = {
        isStarted: true,
        stakes: table.stakes,
        currentBets: [bb],
        players,
        phases: [{ type: 'pre-flop' as const, moves: [], cards: [] }],
        dealerPosition,
        betMap: {
          [sbPlayer.userId.toHexString()]: bb / 2,
          [bbPlayer.userId.toHexString()]: bb,
        },
      };
      safeAssign(game, updateValue);
      await GameCollection.update(game, safeKeys(updateValue));
      dispatch({
        type: 'GAME_STARTED',
        payload: {
          tableId: payload.tableId,
          gameId: game._id.toHexString(),
        },
      });
    });
  },
});
