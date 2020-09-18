import { Table } from 'shared';
import { TableCollection } from '../../collections/Table';
import { createContract, createRpcBinding } from '../../lib';
import { getUsersFromTables } from './getUsersFromTables';
import { mapTable } from '../../common/mapper';

export const getAllTables = createContract('table.getAllTables')
  .params()
  .returns<Table[]>()
  .fn(async () => {
    const items = await TableCollection.find({})
      .sort({
        name: 1,
      })
      .toArray();
    const { userMap } = await getUsersFromTables(items);
    return items.map(item => mapTable(item, userMap));
  });

export const getAllTablesRpc = createRpcBinding({
  signature: 'table.getAllTables',
  handler: getAllTables,
});
