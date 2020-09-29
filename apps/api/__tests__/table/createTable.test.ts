import { GameCollection } from '../../src/collections/Game';
import { TableCollection } from '../../src/collections/Table';
import { createTable } from '../../src/contracts/table/createTable';
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
  await execContract(
    createTable,
    {
      values: {
        name: 't1',
        stakes: 50,
        maxSeats: 6,
      },
    },
    'token_1'
  );
  const tables = await TableCollection.find({}).toArray();
  const games = await GameCollection.find({}).toArray();
  expect(tables).toHaveLength(1);
  expect(games).toHaveLength(1);
  const [table] = tables;
  const [game] = games;
  expect(game.tableId.toHexString()).toEqual(table._id.toHexString());
  expect(table.gameId.toHexString()).toEqual(game._id.toHexString());
  table.gameId = null!;
  table._id = null!;
  expect(table).toMatchInlineSnapshot(`
    Object {
      "_id": null,
      "gameId": null,
      "maxSeats": 6,
      "name": "t1",
      "players": Array [],
      "stakes": 50,
    }
  `);

  await expect(
    execContract(
      createTable,
      {
        values: {
          name: 't1',
          stakes: 50,
          maxSeats: 6,
        },
      },
      'token_1'
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"Table already exists"`);
});

it('should throw an error if not admin', async () => {
  await expect(
    execContract(
      createTable,
      {
        values: {
          name: 't1',
          stakes: 50,
          maxSeats: 6,
        },
      },
      'token_2'
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"Admin only"`);
});
