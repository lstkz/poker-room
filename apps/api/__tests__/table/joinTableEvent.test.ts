import { ObjectID } from 'mongodb';
import { mocked } from 'ts-jest/utils';
import { GameCollection } from '../../src/collections/Game';
import { TableCollection } from '../../src/collections/Table';
import { joinTable, joinTableEvent } from '../../src/contracts/table/joinTable';
import { disconnect } from '../../src/db';
import { dispatch as _dispatch } from '../../src/events/dispatch';
import {
  execContract,
  generateSampleTables,
  generateSampleUsers,
  getTestTableId,
  getTestUserId,
  initDb,
  resetDb,
} from '../helper';

jest.mock('../../src/events/dispatch');

const dispatch = mocked(_dispatch, false);

beforeAll(async () => {
  await initDb();
});

afterAll(disconnect);

beforeEach(async () => {
  await resetDb();
  await generateSampleUsers();
  await generateSampleTables();
});

async function _joinTable(userNr: number, seat: number) {
  await execContract(
    joinTable,
    {
      values: {
        money: 50,
        seat,
        tableId: getTestTableId(1),
      },
    },
    'token_' + userNr
  );
}

it('should ignore if two players', async () => {
  await _joinTable(1, 1);
  await _joinTable(2, 2);
  dispatch.mockReset();

  await joinTableEvent.options.handler({
    tableId: getTestTableId(1),
    userId: getTestUserId(1),
  });
  expect(dispatch.mock.calls).toHaveLength(0);
});

it('should start the game for 3 players', async () => {
  await _joinTable(1, 1);
  await _joinTable(2, 2);
  await _joinTable(3, 3);
  dispatch.mockReset();

  await joinTableEvent.options.handler({
    tableId: getTestTableId(1),
    userId: getTestUserId(1),
  });
  expect(dispatch.mock.calls).toHaveLength(1);
  expect(dispatch.mock.calls[0][0].type).toEqual('GAME_STARTED');

  const table = await TableCollection.findOneOrThrow({
    _id: ObjectID.createFromHexString(getTestTableId(1)),
  });
  expect(table.gameId).toBeTruthy();
  const game = await GameCollection.findOneOrThrow({
    _id: table.gameId!,
  });
  expect(game.pot).toEqual(0.75);
});
