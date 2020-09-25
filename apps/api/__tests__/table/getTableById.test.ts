import { getTableById } from '../../src/contracts/table/getTableById';
import { disconnect } from '../../src/db';
import {
  execContract,
  generateSampleTables,
  generateSampleUsers,
  getTestTableId,
  initDb,
  resetDb,
} from '../helper';

beforeAll(async () => {
  await initDb();
});

afterAll(disconnect);

beforeEach(async () => {
  await resetDb();
  await generateSampleUsers();
  await generateSampleTables();
});

test.each([["'id' must match regex /^[a-f0-9]{24}$/.", 'abc']])(
  'validation: throw %s for %j',
  async (error, id) => {
    await expect(
      execContract(
        getTableById,
        {
          id,
        },
        'token_1'
      )
    ).rejects.toThrow(error);
  }
);

it('should throw an error if table not found', async () => {
  await expect(
    execContract(
      getTableById,
      {
        id: getTestTableId(9),
      },
      'token_1'
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"Table not found"`);
});

it('should return a table', async () => {
  const ret = await execContract(
    getTableById,
    {
      id: getTestTableId(1),
    },
    'token_1'
  );
  expect(ret).toMatchInlineSnapshot(`
    Object {
      "id": "100000000000000000000001",
      "maxSeats": 6,
      "name": "t1",
      "players": Array [],
      "stakes": 50,
    }
  `);
});
