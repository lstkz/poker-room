import { S } from 'schema';
import { Foo } from 'shared';
import { FooTestCollection } from '../../collections/FooTest';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types';

export const createFoo = createContract('example.createFoo')
  .params('user', 'values')
  .schema({
    user: S.object().optional().as<AppUser>(),
    values: S.object().keys({
      foo: S.string(),
    }),
  })
  .returns<Foo>()
  .fn(async (user, values) => {
    const bar = 'generated-' + Date.now();
    const insertResult = await FooTestCollection.insertOne({
      foo: values.foo,
      bar,
    });
    return {
      id: insertResult.insertedId.toHexString(),
      foo: values.foo,
      bar,
    };
  });

export const createFooRpc = createRpcBinding({
  injectUser: true,
  public: true,
  signature: 'example.createFoo',
  handler: createFoo,
});
