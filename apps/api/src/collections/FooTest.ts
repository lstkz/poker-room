import { ObjectID } from 'mongodb';
import { createCollection } from '../db';

export interface FooTestModel {
  _id: ObjectID;
  foo: string;
  bar: string;
}

export const FooTestCollection = createCollection<FooTestModel>('fooTest', [
  {
    key: {
      foo: 1,
    },
  },
]);
