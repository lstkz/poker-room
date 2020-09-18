import { createCollection } from '../db';

export interface AccessTokenModel {
  _id: string;
  userId: string;
}

export const AccessTokenCollection = createCollection<AccessTokenModel>(
  'accessToken'
);
