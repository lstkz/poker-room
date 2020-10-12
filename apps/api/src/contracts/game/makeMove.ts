import { ObjectID } from 'mongodb';
import { S } from 'schema';
import { MoveType, moveTypes } from 'shared';
import { GameCollection } from '../../collections/Game';
import {
  getActPlayer,
  processMove,
  processNextPhase,
} from '../../common/engine';
import { BadRequestError } from '../../common/errors';
import { withTransaction } from '../../db';
import { dispatch } from '../../events/dispatch';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';
import { safeKeys } from '../../common/helper';

export const makeMove = createContract('game.makeMove')
  .params('user', 'values')
  .schema({
    user: S.object().as<AppUser>(),
    values: S.object().keys({
      gameId: S.string().objectId(),
      moveType: S.enum().literal<MoveType>(...moveTypes),
      raiseAmount: S.number().optional(),
    }),
  })
  .returns<void>()
  .fn(async (user, values) => {
    await withTransaction(async () => {
      const game = await GameCollection.findOneOrThrow({
        _id: ObjectID.createFromHexString(values.gameId),
      });
      if (game.isDone) {
        throw new BadRequestError('Game is finished');
      }
      const actPlayer = getActPlayer(game);
      if (!actPlayer.userId.equals(user.id)) {
        throw new BadRequestError("It's not your turn");
      }
      processMove(
        {
          moveType: values.moveType,
          raiseAmount: values.raiseAmount,
        },
        game
      );
      await processNextPhase(game);
      await GameCollection.update(game, safeKeys(game));
      dispatch({
        type: 'GAME_UPDATED',
        payload: { gameId: game._id.toHexString() },
      });
    });
  });

export const makeMoveRpc = createRpcBinding({
  injectUser: true,
  signature: 'game.makeMove',
  handler: makeMove,
});
