import * as R from 'remeda';
import { ObjectID } from 'mongodb';
import { S } from 'schema';
import { Game } from 'shared';
import { GameCollection } from '../../collections/Game';
import { TableCollection } from '../../collections/Table';
import { TableNotFoundError } from '../../common/errors';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';
import { UserCollection, UserModel } from '../../collections/User';

export const getCurrentGame = createContract('game.getCurrentGame')
  .params('user', 'tableId')
  .schema({
    user: S.object().as<AppUser>(),
    tableId: S.string().objectId(),
  })
  .returns<Game>()
  .fn(async (user, tableId) => {
    const table = await TableCollection.findOne({
      _id: ObjectID.createFromHexString(tableId),
    });
    if (!table) {
      throw new TableNotFoundError();
    }
    const playerIds = table.players.map(x => x.userId);
    const players: UserModel[] = playerIds.length
      ? await UserCollection.findAll({
          _id: {
            $in: playerIds,
          },
        })
      : [];
    const playerMap = R.indexBy(players, x => x._id);
    const game = await GameCollection.findOneOrThrow({ _id: table.gameId });
    return {
      id: game._id.toHexString(),
      tableId: game.tableId.toHexString(),
      ...R.pick(game, [
        'isStarted',
        'isDone',
        'dealerPosition',
        'stakes',
        'pot',
        'betMap',
        'currentBets',
      ]),
      phases: game.phases.map(item => ({
        cards: item.cards,
        moves: item.moves.map(move => ({
          userId: move.userId.toHexString(),
          moveType: move.moveType,
          amount: move.amount,
        })),
        type: item.type,
      })),
      players: game.players.map(item => ({
        user: {
          id: item.userId.toHexString(),
          username: playerMap[item.userId.toHexString()].username,
        },
        hand: item.userId.equals(user.id) ? item.hand : null,
        money: item.money,
        seat: item.seat,
      })),
    };
  });

export const getCurrentGameRpc = createRpcBinding({
  injectUser: true,
  signature: 'game.getCurrentGame',
  handler: getCurrentGame,
});
