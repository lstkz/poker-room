import { ObjectID } from 'mongodb';
import { UserCollection } from '../src/collections/User';
import { INITIAL_BANKROLL } from '../src/config';
import { createTable } from '../src/contracts/table/createTable';
import { getAllTables } from '../src/contracts/table/getAllTables';
import { getTableById } from '../src/contracts/table/getTableById';
import { joinTable } from '../src/contracts/table/joinTable';
import { leaveTable } from '../src/contracts/table/leaveTable';
import { disconnect } from '../src/db';
import {
  execContract,
  generateSampleTables,
  generateSampleUsers,
  getTestTableId,
  getTestUserId,
  initDb,
  resetDb,
} from './helper';

beforeAll(async () => {
  await initDb();
});

afterAll(disconnect);

beforeEach(async () => {
  await resetDb();
  await generateSampleUsers();
});

describe('getAllTables', () => {
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
});

describe('joinTable', () => {
  beforeEach(async () => {
    await generateSampleTables();
  });
  const validValues = {
    tableId: getTestTableId(1),
    money: 10,
    seat: 1,
  };

  test.each([
    [
      "'values.tableId' must match regex /^[a-f0-9]{24}$/.",
      { ...validValues, tableId: 'abc' },
    ],
    [
      "'values.money' must be greater or equal to 0.01.",
      { ...validValues, money: 0 },
    ],
    [
      "'values.seat' must be greater or equal to 1.",
      { ...validValues, seat: 0 },
    ],
  ])('validation: throw %s for %j', async (error, values) => {
    await expect(
      execContract(
        joinTable,
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
        joinTable,
        {
          values: {
            ...validValues,
            tableId: getTestTableId(9),
          },
        },
        'token_1'
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Table not found"`);
  });

  it('should throw an error if invalid seat', async () => {
    await expect(
      execContract(
        joinTable,
        {
          values: {
            ...validValues,
            seat: 10,
          },
        },
        'token_1'
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Invalid seat"`);
  });

  it('should throw an error if seat taken', async () => {
    await execContract(
      joinTable,
      {
        values: validValues,
      },
      'token_1'
    );
    await expect(
      execContract(
        joinTable,
        {
          values: validValues,
        },
        'token_2'
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Seat already taken by another player"`
    );
  });

  it('should throw an error if already joined', async () => {
    await execContract(
      joinTable,
      {
        values: validValues,
      },
      'token_1'
    );
    await expect(
      execContract(
        joinTable,
        {
          values: { ...validValues, seat: 2 },
        },
        'token_1'
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Already joined"`);
  });

  it('should throw an error if not enough money', async () => {
    await UserCollection.findOneAndUpdate(
      {
        _id: ObjectID.createFromHexString(getTestUserId(1)),
      },
      {
        $set: {
          bankroll: 40,
        },
      }
    );
    await expect(
      execContract(
        joinTable,
        {
          values: {
            ...validValues,
            money: 50,
          },
        },
        'token_1'
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Not enough money"`);
  });

  it('should throw an error if invalid money (too lower)', async () => {
    await expect(
      execContract(
        joinTable,
        {
          values: {
            ...validValues,
            money: 1,
          },
        },
        'token_1'
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Min entry: 10$"`);
  });

  it('should throw an error if invalid money (too much)', async () => {
    await expect(
      execContract(
        joinTable,
        {
          values: {
            ...validValues,
            money: 500,
          },
        },
        'token_1'
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Max entry: 50$"`);
  });

  it('user should join the table successfully', async () => {
    const ret = await execContract(
      joinTable,
      {
        values: validValues,
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
            "money": 10,
            "seat": 1,
            "user": Object {
              "id": "000000000000000000000001",
              "username": "user1",
            },
          },
        ],
        "stakes": 50,
      }
    `);
  });

  it('two user should join the table successfully', async () => {
    await execContract(
      joinTable,
      {
        values: validValues,
      },
      'token_1'
    );
    const ret = await execContract(
      joinTable,
      {
        values: { ...validValues, seat: 3 },
      },
      'token_2'
    );
    expect(ret).toMatchInlineSnapshot(`
      Object {
        "id": "100000000000000000000001",
        "maxSeats": 6,
        "name": "t1",
        "players": Array [
          Object {
            "money": 10,
            "seat": 1,
            "user": Object {
              "id": "000000000000000000000001",
              "username": "user1",
            },
          },
          Object {
            "money": 10,
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
});

describe('leaveTable', () => {
  beforeEach(async () => {
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
});

describe('getTableById', () => {
  beforeEach(async () => {
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
});
