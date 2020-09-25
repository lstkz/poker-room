import { createTable } from '../../src/contracts/table/createTable';
import { getAllTables } from '../../src/contracts/table/getAllTables';
import { disconnect } from '../../src/db';
import { execContract, generateSampleUsers, initDb, resetDb } from '../helper';

beforeAll(async () => {
  await initDb();
});

afterAll(disconnect);

beforeEach(async () => {
  await resetDb();
  await generateSampleUsers();
});

it('should return an empty array if no tables', async () => {
  const ret = await execContract(getAllTables, {}, 'token_1');
  expect(ret).toEqual([]);
});

it('should return tables', async () => {
  await createTable({
    name: 't1',
    maxSeats: 5,
    stakes: 50,
  });
  await createTable({
    name: 't2',
    maxSeats: 5,
    stakes: 100,
  });
  const ret = await execContract(getAllTables, {}, 'token_1');
  ret.forEach(item => {
    item.id = 'id';
  });
  expect(ret).toMatchInlineSnapshot(`
    Array [
      Object {
        "id": "id",
        "maxSeats": 5,
        "name": "t1",
        "players": Array [],
        "stakes": 50,
      },
      Object {
        "id": "id",
        "maxSeats": 5,
        "name": "t2",
        "players": Array [],
        "stakes": 100,
      },
    ]
  `);
});
