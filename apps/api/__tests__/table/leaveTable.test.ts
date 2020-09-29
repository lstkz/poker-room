import { ObjectID } from 'mongodb';
import { UserCollection } from '../../src/collections/User';
import { INITIAL_BANKROLL } from '../../src/config';
import { joinTable } from '../../src/contracts/table/joinTable';
import { leaveTable } from '../../src/contracts/table/leaveTable';
import { disconnect } from '../../src/db';
import {
  execContract,
  generateSampleTables,
  generateSampleUsers,
  getTestTableId,
  getTestUserId,
  initDb,
  resetDb,
} from '../helper';

jest.mock('../../src/events/dispatch', () => {
  return {
    dispatch() {
      //
    },
  };
});

beforeAll(async () => {
  await initDb();
});

afterAll(disconnect);

beforeEach(async () => {
  await resetDb();
  await generateSampleUsers();
  await generateSampleTables();
});

test.each([
  ["'values.tableId' must match regex /^[a-f0-9]{24}$/.", { tableId: 'abc' }],
])('validation: throw %s for %j', async (error, values) => {
  await expect(
    execContract(
      leaveTable,
      {
        values,
      },
      'token_1'
    )
  ).rejects.toThrow(error);
});

it('should throw an error if table not found', async () => {
  await expect(
    execContract(
      leaveTable,
      {
        values: {
          tableId: getTestTableId(9),
        },
      },
      'token_1'
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"Table not found"`);
});

it('should throw an error if not joined', async () => {
  await expect(
    execContract(
      leaveTable,
      {
        values: {
          tableId: getTestTableId(1),
        },
      },
      'token_1'
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"Not joined"`);
});

it('user should leave successfully', async () => {
  await execContract(
    joinTable,
    {
      values: {
        tableId: getTestTableId(1),
        money: 20,
        seat: 1,
      },
    },
    'token_1'
  );
  const ret = await execContract(
    leaveTable,
    {
      values: {
        tableId: getTestTableId(1),
      },
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
  const user = await UserCollection.findOneOrThrow({
    _id: ObjectID.createFromHexString(getTestUserId(1)),
  });
  expect(user.bankroll).toEqual(INITIAL_BANKROLL);
});

it('join 2 users and 1 user should leave successfully', async () => {
  await execContract(
    joinTable,
    {
      values: {
        tableId: getTestTableId(1),
        money: 20,
        seat: 1,
      },
    },
    'token_1'
  );
  await execContract(
    joinTable,
    {
      values: {
        tableId: getTestTableId(1),
        money: 20,
        seat: 3,
      },
    },
    'token_2'
  );
  const ret = await execContract(
    leaveTable,
    {
      values: {
        tableId: getTestTableId(1),
      },
    },
    'token_1'
  );
  expect(ret).toMatchInlineSnapshot(`
    Object {
      "id": "100000000000000000000001",
      "maxSeats": 6,
      "name": "t1",
      "players": Array [
        Object {
          "money": 20,
          "seat": 3,
          "user": Object {
            "id": "000000000000000000000002",
            "username": "user2",
          },
        },
      ],
      "stakes": 50,
    }
  `);
});
