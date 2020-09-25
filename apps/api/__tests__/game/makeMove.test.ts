import { makeMove } from '../../src/contracts/game/makeMove';
import { createTable } from '../../src/contracts/table/createTable';
import { getAllTables } from '../../src/contracts/table/getAllTables';
import { joinTable } from '../../src/contracts/table/joinTable';
import { disconnect } from '../../src/db';
import {
  execContract,
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

xit('should return an empty array if no tables', async () => {
  const ret = await execContract(makeMove, {}, 'token_1');
  expect(ret).toEqual([]);
});
