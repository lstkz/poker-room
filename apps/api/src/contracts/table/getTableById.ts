import { ObjectID } from 'mongodb';
import { S } from 'schema';
import { Table } from 'shared';
import { TableCollection } from '../../collections/Table';
import { TableNotFoundError } from '../../common/errors';
import { mapTable } from '../../common/mapper';
import { createContract, createRpcBinding } from '../../lib';
import { getUsersFromTables } from './getUsersFromTables';

export const getTableById = createContract('table.getTableById')
  .params('id')
  .schema({
    id: S.string().objectId(),
  })
  .returns<Table>()
  .fn(async id => {
    const table = await TableCollection.findOne({
      _id: ObjectID.createFromHexString(id),
    });
    if (!table) {
      throw new TableNotFoundError();
    }
    const { userMap } = await getUsersFromTables([table]);
    return mapTable(table, userMap);
  });

export const getTableByIdRpc = createRpcBinding({
  signature: 'table.getTableById',
  handler: getTableById,
});
