import { createFoo } from '../src/contracts/example/createFoo';
import { getAll } from '../src/contracts/example/getAll';
import { disconnect } from '../src/db';
import { execContract, initDb, resetDb } from './helper';

beforeAll(async () => {
  await initDb();
});

afterAll(disconnect);

beforeEach(resetDb);

it('createFoo and get all foo', async () => {
  const createdFoo = await execContract(createFoo, {
    values: {
      foo: 'foo',
    },
  });
  expect(createdFoo.bar).toContain('generated-');
  expect(createdFoo.foo).toEqual('foo');

  const all = await execContract(getAll, {});
  expect(all).toHaveLength(1);
});
