import { S } from 'schema';
import { Foo } from 'shared';
import { FooTestCollection } from '../../collections/FooTest';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';

export const createFoo = createContract('example.createFoo')
  .params('user', 'values')
  .schema({
    user: S.object().as<AppUser>().optional(),
    values: S.object().keys({
      foo: S.string(),
    }),
  })
  .fn(async (user, values) => {
    const bar = 'generated-' + Date.now();
    const insertResult = await FooTestCollection.insertOne({
      foo: values.foo,
      bar,
    });
    const ret: Foo = {
      id: insertResult.insertedId.toHexString(),
      foo: values.foo,
      bar,
    };
    return ret;
  });

export const createFooRpc = createRpcBinding({
  injectUser: true,
  public: true,
  signature: 'example.createFoo',
  handler: createFoo,
});
