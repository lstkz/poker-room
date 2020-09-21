import { S } from 'schema';
import { TableCollection } from '../../collections/Table';
import { safeAssign, safeKeys } from '../../common/helper';
import { createContract } from '../../lib';

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
    const existing = await TableCollection.findOne({ name: values.name });
    if (existing) {
      safeAssign(existing, values);
      await TableCollection.update(existing, safeKeys(values));
    } else {
      await TableCollection.insertOne({
        ...values,
        players: [],
        gameId: null,
      });
    }
  });
