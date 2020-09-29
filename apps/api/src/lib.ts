import { ContractMeta, initialize } from 'contract';
import { StringSchema } from 'schema';
import { LOG_LEVEL } from './config';
import { AppEvent, AppEventType } from './types';

export interface CreateRpcBindingOptions {
  verified?: true;
  injectUser?: boolean;
  public?: true;
  admin?: true;
  signature: string;
  handler: ((...args: any[]) => any) & ContractMeta<any>;
}

export interface BaseBinding<T, U> {
  isBinding: boolean;
  type: T;
  options: U;
}

export interface RpcBinding
  extends BaseBinding<'rpc', CreateRpcBindingOptions> {}

export function createRpcBinding(options: CreateRpcBindingOptions): RpcBinding {
  return {
    isBinding: true,
    type: 'rpc',
    options,
  };
}

type ExtractPayload<T> = T extends { payload: infer S } ? S : never;

type ExtractEvent<T> = AppEvent extends { type: infer K }
  ? K extends T
    ? ExtractPayload<Pick<AppEvent, 'payload'>>
    : never
  : never;

export interface CreateEventBindingOptions<T extends AppEventType> {
  type: T;
  handler: (event: ExtractEvent<T>) => Promise<void>;
}

export interface EventBinding<T extends AppEventType>
  extends BaseBinding<'event', CreateEventBindingOptions<T>> {}

export function createEventBinding<T extends AppEventType>(
  options: CreateEventBindingOptions<T>
): EventBinding<T> {
  return {
    isBinding: true,
    type: 'event',
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
