import { S } from 'schema';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';

export const getCurrentGame = createContract('game.getCurrentGame')
  .params('user', 'tableId')
  .schema({
    user: S.object().as<AppUser>(),
    tableId: S.string().objectId(),
  })
  .returns<Foo>()
  .fn(async (user, values) => {});

export const getCurrentGameRpc = createRpcBinding({
  injectUser: true,
  signature: 'game.getCurrentGame',
  handler: getCurrentGame,
});
