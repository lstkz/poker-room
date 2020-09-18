import { S } from 'schema';
import { User } from 'shared';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';

export const getMe = createContract('user.getMe')
  .params('user')
  .schema({
    user: S.object().as<AppUser>(),
  })
  .returns<User>()
  .fn(async user => {
    return {
      id: user.id,
      username: user.username,
    };
  });

export const getMeRpc = createRpcBinding({
  injectUser: true,
  signature: 'user.getMe',
  handler: getMe,
});
