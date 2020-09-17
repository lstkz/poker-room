import { S } from 'schema';
import { AuthData, RegisterKeysSchema } from 'shared';
import { UserCollection } from '../../collections/User';
import { BadRequestError } from '../../common/errors';
import { generateSalt, hashPassword } from '../../common/helper';
import { DUPLICATED_UNIQUE_VALUE_ERROR_CODE } from '../../common/mongo';
import { createContract, createRpcBinding } from '../../lib';
import { generateAuthData } from './generateAuthData';

export const register = createContract('user.register')
  .params('values')
  .schema({
    values: S.object().keys(RegisterKeysSchema),
  })
  .returns<AuthData>()
  .fn(async values => {
    const salt = await generateSalt();
    const passwordHash = await hashPassword(values.password, salt);
    const inserted = await UserCollection.insertOne({
      username: values.username,
      passwordHash,
      salt,
    }).catch(e => {
      if (e.code === DUPLICATED_UNIQUE_VALUE_ERROR_CODE) {
        throw new BadRequestError('Username is already taken');
      }
      throw e;
    });
    const userId = inserted.insertedId.toHexString();
    return generateAuthData(userId);
  });

export const registerRpc = createRpcBinding({
  public: true,
  signature: 'user.register',
  handler: register,
});
