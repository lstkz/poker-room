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

jest.mock('../../src/common/random', () => {
  return {
    async randomInt() {
      return 0;
    },
  };
});

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
  game._id = ObjectID.createFromTime(1);
  expect(game).toMatchInlineSnapshot(`
    Object {
      "_id": "000000010000000000000000",
      "betMap": Object {
        "000000000000000000000002": 0.25,
        "000000000000000000000003": 0.5,
      },
      "currentBets": Array [
        0.5,
      ],
      "dealerPosition": 1,
      "isDone": false,
      "isStarted": true,
      "maxSeats": 6,
      "phases": Array [
        Object {
          "cards": Array [],
          "moves": Array [],
          "type": "pre-flop",
        },
      ],
      "players": Array [
        Object {
          "hand": Array [
            Object {
              "card": 2,
              "color": "c",
            },
            Object {
              "card": 2,
              "color": "s",
            },
          ],
          "money": 50,
          "seat": 1,
          "userId": "000000000000000000000001",
        },
        Object {
          "hand": Array [
            Object {
              "card": 2,
              "color": "d",
            },
            Object {
              "card": 3,
              "color": "c",
            },
          ],
          "money": 50,
          "seat": 2,
          "userId": "000000000000000000000002",
        },
        Object {
          "hand": Array [
            Object {
              "card": 2,
              "color": "h",
            },
            Object {
              "card": 3,
              "color": "d",
            },
          ],
          "money": 50,
          "seat": 3,
          "userId": "000000000000000000000003",
        },
      ],
      "pot": 0,
      "stakes": 50,
      "tableId": "100000000000000000000001",
    }
  `);
});
