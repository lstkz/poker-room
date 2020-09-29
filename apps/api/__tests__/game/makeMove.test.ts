import { ObjectID } from 'mongodb';
import { GameCollection } from '../../src/collections/Game';
import { makeMove } from '../../src/contracts/game/makeMove';
import { disconnect } from '../../src/db';
import {
  execContract,
  generateSampleTables,
  generateSampleUsers,
  getTestGameId,
  initDb,
  joinTableWithDispatch as joinTableHelper,
  resetDb,
} from '../helper';

jest.mock('../../src/events/dispatch', () => {
  return {
    dispatch() {
      //
    },
  };
});

jest.mock('../../src/common/random', () => {
  return {
    async randomInt() {
      return 0;
    },
  };
});

beforeAll(async () => {
  await initDb();
});

afterAll(disconnect);

beforeEach(async () => {
  await resetDb();
  await Promise.all([generateSampleUsers(), generateSampleTables()]);
  await joinTableHelper({ userNr: 1, seat: 1, tableNr: 1, noDispatch: true });
  await joinTableHelper({ userNr: 2, seat: 2, tableNr: 1, noDispatch: true });
  await joinTableHelper({ userNr: 3, seat: 3, tableNr: 1, noDispatch: true });
  await joinTableHelper({ userNr: 4, seat: 4, tableNr: 1 });
});

it('should throw an error if not player turn', async () => {
  await expect(
    execContract(
      makeMove,
      {
        values: {
          gameId: getTestGameId(1),
          moveType: 'call',
        },
      },
      'token_2'
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"It's not your turn"`);
});

xit('should throw an error if game is finished', async () => {});

it('should throw an error if illegal move', async () => {
  await expect(
    execContract(
      makeMove,
      {
        values: {
          gameId: getTestGameId(1),
          moveType: 'check',
        },
      },
      'token_4'
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Invalid poker move: Can't check if another player bet"`
  );
});

it('should make a legal move', async () => {
  await execContract(
    makeMove,
    {
      values: {
        gameId: getTestGameId(1),
        moveType: 'call',
      },
    },
    'token_4'
  );
  const game = await GameCollection.findOneOrThrow({
    _id: ObjectID.createFromHexString(getTestGameId(1)),
  });
  expect(game.phases).toHaveLength(1);
  expect(game.phases).toMatchInlineSnapshot(`
    Array [
      Object {
        "cards": Array [],
        "moves": Array [
          Object {
            "amount": 0.5,
            "moveType": "call",
            "userId": "000000000000000000000004",
          },
        ],
        "type": "pre-flop",
      },
    ]
  `);
});

xit('should finish the game', async () => {
  await execContract(
    makeMove,
    {
      values: {
        gameId: getTestGameId(1),
        moveType: 'fold',
      },
    },
    'token_4'
  );
  await execContract(
    makeMove,
    {
      values: {
        gameId: getTestGameId(1),
        moveType: 'fold',
      },
    },
    'token_1'
  );
  await execContract(
    makeMove,
    {
      values: {
        gameId: getTestGameId(1),
        moveType: 'fold',
      },
    },
    'token_2'
  );
  const game = await GameCollection.findOneOrThrow({
    _id: ObjectID.createFromHexString(getTestGameId(1)),
  });
  expect(game.isDone).toEqual(true);
});
