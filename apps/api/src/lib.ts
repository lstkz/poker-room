import { ContractMeta, initialize } from 'contract';
import { S, StringSchema } from 'schema';
import { LOG_LEVEL } from './config';

export interface CreateRpcBindingOptions {
  verified?: true;
  injectUser?: boolean;
  public?: true;
  admin?: true;
  signature: string;
  handler: ((...args: any[]) => any) & ContractMeta<any>;
}

export interface RpcBinding {
  isBinding: boolean;
  type: 'rpc';
  options: CreateRpcBindingOptions;
}

export function createRpcBinding(options: CreateRpcBindingOptions): RpcBinding {
  return {
    isBinding: true,
    type: 'rpc',
    options,
  };
}

export const { createContract } = initialize({
  debug: LOG_LEVEL === 'debug',
});

declare module 'schema/src/StringSchema' {
  interface StringSchema {
    objectId(): this;
  }
}

StringSchema.prototype.objectId = function objectId(this: StringSchema) {
  return this.regex(/^[a-f0-9]{24}$/);
};
