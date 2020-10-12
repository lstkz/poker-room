import { ObjectID } from 'mongodb';
import { S } from 'schema';
import { GameCollection, GameModel } from '../../collections/Game';
import { TableCollection } from '../../collections/Table';
import { BadRequestError } from '../../common/errors';
import { withTransaction } from '../../db';
import { createContract, createRpcBinding } from '../../lib';

export const createTable = createContract('table.createTable')
  .params('values')
  .schema({
    values: S.object().keys({
      name: S.string(),
      stakes: S.number(),
      maxSeats: S.number(),
    }),
  })
  .returns<void>()
  .fn(async values => {
    await withTransaction(async () => {
      const existing = await TableCollection.findOne({ name: values.name });
      if (existing) {
        throw new BadRequestError('Table already exists');
      }
      const tableId = new ObjectID();
      const gameId = new ObjectID();
      const gameValues: GameModel = {
        _id: gameId,
        isStarted: false,
        isDone: false,
        tableId: tableId,
        pot: 0,
        stakes: 0,
        currentBets: [],
        players: [],
        phases: [{ type: 'pre-flop', moves: [], cards: [] }],
        dealerPosition: -1,
        betMap: {},
      };
      await GameCollection.insertOne(gameValues);
      await TableCollection.insertOne({
        _id: tableId,
        ...values,
        players: [],
        gameId: gameId,
      });
    });
  });

export const createTableRpc = createRpcBinding({
  admin: true,
  signature: 'table.createTable',
  handler: createTable,
});
