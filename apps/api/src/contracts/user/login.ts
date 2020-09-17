import { S } from 'schema';
import { AuthData } from 'shared';
import { UserCollection } from '../../collections/User';
import { BadRequestError } from '../../common/errors';
import { hashPassword } from '../../common/helper';
import { createContract, createRpcBinding } from '../../lib';
import { generateAuthData } from './generateAuthData';

const ERROR_MSG = 'Invalid username or password';

export const login = createContract('user.login')
  .params('values')
  .schema({
    values: S.object().keys({
      username: S.string(),
      password: S.string(),
    }),
  })
  .returns<AuthData>()
  .fn(async values => {
    const existing = await UserCollection.findOne({
      username: values.username.toLowerCase(),
    });
    if (!existing) {
      throw new BadRequestError(ERROR_MSG);
    }

    const passwordHash = await hashPassword(values.password, existing.salt);
    if (passwordHash !== existing.passwordHash) {
      throw new BadRequestError(ERROR_MSG);
    }

    return generateAuthData(existing._id.toHexString());
  });

export const loginRpc = createRpcBinding({
  public: true,
  signature: 'user.login',
  handler: login,
});
