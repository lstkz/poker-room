import * as R from 'remeda';
import {
  BaseBinding,
  CreateEventBindingOptions,
  CreateRpcBindingOptions,
} from '../lib';

const bindings = [
  require('../contracts/user/getMe'),
  require('../contracts/user/login'),
  require('../contracts/user/register'),
  require('../contracts/table/createTable'),
  require('../contracts/table/getAllTables'),
  require('../contracts/table/joinTable'),
  require('../contracts/table/leaveTable'),
  require('../contracts/table/getTableById'),
  require('../contracts/table/createTable'),
  require('../contracts/game/getCurrentGame'),
  require('../contracts/game/makeMove'),
  require('../contracts/example/createFoo'),
  require('../contracts/example/getAll'),
];

export function getBindings(type: 'rpc'): CreateRpcBindingOptions[];
export function getBindings(type: 'event'): CreateEventBindingOptions<any>[];
export function getBindings(
  type: 'rpc' | 'event'
): CreateRpcBindingOptions[] | CreateEventBindingOptions<any>[] {
  return R.pipe(
    bindings,
    R.flatMap(obj => Object.values(obj) as BaseBinding<string, any>[]),
    R.filter(x => x.isBinding && x.type === type),
    R.map(x => x.options)
  );
}
