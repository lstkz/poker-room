import { ContractMeta, initialize } from 'contract';
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
