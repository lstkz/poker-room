import { FooTestCollection } from '../../collections/FooTest';
import { createContract, createRpcBinding } from '../../lib';
import { Foo } from 'shared';
import { renameId } from '../../common/helper';

export const getAll = createContract('example.getAll')
  .params()
  .fn(async () => {
    const result = await FooTestCollection.find({}).limit(100).toArray();
    const ret: Foo[] = result.map(renameId);
    return ret;
  });

export const getAllRpc = createRpcBinding({
  public: true,
  signature: 'example.getAll',
  handler: getAll,
});
