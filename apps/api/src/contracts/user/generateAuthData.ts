import { ObjectID } from 'mongodb';
import { AuthData } from 'shared';
import { AccessTokenCollection } from '../../collections/AccessToken';
import { UserCollection } from '../../collections/User';
import { randomString } from '../../common/helper';

export async function generateAuthData(userId: string): Promise<AuthData> {
  const accessToken = await randomString(30);
  await AccessTokenCollection.insertOne({
    _id: accessToken,
    userId,
  });
  const user = await UserCollection.findOneOrThrow({
    _id: ObjectID.createFromHexString(userId),
  });
  return {
    accessToken,
    user: {
      id: user._id.toHexString(),
      username: user.username,
    },
  };
}
