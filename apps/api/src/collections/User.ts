import { ObjectID } from 'mongodb';
import { createCollection } from '../db';

export interface UserModel {
  _id: ObjectID;
  username: string;
  passwordHash: string;
  salt: string;
}

export const UserCollection = createCollection<UserModel>('user', [
  {
    key: {
      username: 1,
    },
    unique: true,
  },
]);
