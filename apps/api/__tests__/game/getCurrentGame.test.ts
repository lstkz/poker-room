import { getCurrentGame } from '../../src/contracts/game/getCurrentGame';
import { makeMove } from '../../src/contracts/game/makeMove';
import { disconnect } from '../../src/db';
import {
  execContract,
  generateSampleTables,
  generateSampleUsers,
  getTestGameId,
  getTestTableId,
  initDb,
  joinTableWithDispatch,
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
  await generateSampleUsers();
  await generateSampleTables();
});

it('should return a game with no players', async () => {
  const ret = await execContract(
    getCurrentGame,
    {
      tableId: getTestTableId(1),
    },
    'token_1'
  );
  expect(ret).toMatchSnapshot();
});

it('should return a game with 3 players (new games)', async () => {
  await joinTableWithDispatch({ userNr: 1, seat: 1, tableNr: 1 });
  await joinTableWithDispatch({ userNr: 2, seat: 2, tableNr: 1 });
  await joinTableWithDispatch({ userNr: 3, seat: 3, tableNr: 1 });
  const ret = await execContract(
    getCurrentGame,
    {
      tableId: getTestTableId(1),
    },
    'token_1'
  );
  expect(ret).toMatchSnapshot();
});

xit('should return a game with 3 players (with moves)', async () => {
  await joinTableWithDispatch({ userNr: 1, seat: 1, tableNr: 1 });
  await joinTableWithDispatch({ userNr: 2, seat: 2, tableNr: 1 });
  await joinTableWithDispatch({ userNr: 3, seat: 3, tableNr: 1 });
  await execContract(
    makeMove,
    {
      values: {
        gameId: getTestGameId(1),
        moveType: 'call',
      },
    },
    'token_1'
  );
  await execContract(
    makeMove,
    {
      values: {
        gameId: getTestGameId(1),
        moveType: 'call',
      },
    },
    'token_2'
  );
  await execContract(
    makeMove,
    {
      values: {
        gameId: getTestGameId(1),
        moveType: 'check',
      },
    },
    'token_3'
  );
  const ret = await execContract(
    getCurrentGame,
    {
      tableId: getTestTableId(1),
    },
    'token_1'
  );
  expect(ret).toMatchSnapshot();
});
