import { S } from 'schema';
import { createContract, createRpcBinding } from '../../lib';
import { AppUser } from '../../types'


export const {{name}} = createContract('{{ns}}.{{name}}')
  .params('user', 'values')
  .schema({
    user: S.object().as<AppUser>(),
    values: S.object().keys({
    })
  })
  .returns<Foo>()
  .fn(async (user, values) => {

  });

export const {{name}}Rpc = createRpcBinding({
  injectUser: true,
  signature: '{{ns}}.{{name}}',
  handler: {{name}},
});
