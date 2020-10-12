import { FooTestCollection } from '../../collections/FooTest';
import { createContract, createRpcBinding } from '../../lib';
import { Foo } from 'shared';
import { renameId } from '../../common/helper';

export const getAll = createContract('example.getAll')
  .params()
  .returns<Foo[]>()
  .fn(async () => {
    const result = await (await FooTestCollection.find({}))
      .limit(100)
      .toArray();
    return result.map(renameId);
  });

export const getAllRpc = createRpcBinding({
  public: true,
  signature: 'example.getAll',
  handler: getAll,
});
