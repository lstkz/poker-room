import { ClientSession, ObjectID } from 'mongodb';
import * as R from 'remeda';
import { S } from 'schema';
import { MoveType, moveTypes } from 'shared';
import { GameCollection } from '../../collections/Game';
import { getActPlayer, processMove, validateMove } from '../../common/engine';
import { BadRequestError, UnreachableCaseError } from '../../common/errors';
import { startSession } from '../../db';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';

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
    let session: ClientSession = null!;
    try {
      session = await startSession();
      await session.withTransaction(async () => {
        const game = await GameCollection.findOne({
          _id: ObjectID.createFromHexString(values.gameId),
        });
        if (!game) {
          throw new BadRequestError('Game not found');
        }
        if (!game.isPlaying) {
          throw new BadRequestError('Game is finished');
        }
        validateMove(
          {
            moveType: values.moveType,
            raiseAmount: values.raiseAmount,
          },
          game
        );
        processMove(
          {
            moveType: values.moveType,
            raiseAmount: values.raiseAmount,
          },
          game
        );

        // const actPlayer = getActPlayer(game);
        // if (!actPlayer.userId.equals(user.id)) {
        //   throw new BadRequestError("It's not your turn");
        // }
        // const phase = R.last(game.phases)!;
        // const lastMove = R.last(phase.moves);
        // const nextMove = {
        //   userId: ObjectID.createFromHexString(user.id),
        //   amount: values.raiseAmount ?? 0,
        //   moveType: values.moveType,
        // };
      });
    } finally {
      await session.endSession();
    }
  });

export const makeMoveRpc = createRpcBinding({
  injectUser: true,
  signature: 'game.makeMove',
  handler: makeMove,
});
