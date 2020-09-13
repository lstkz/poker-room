import { Schema, Convert } from 'schema';

interface Contract4<
  ARG1 extends string,
  ARG2 extends string,
  ARG3 extends string,
  ARG4 extends string,
  TSchema extends { [key in ARG1 | ARG2 | ARG3 | ARG4]: Schema }
> {
  schema<T extends { [key in ARG1 | ARG2 | ARG3 | ARG4]: Schema }>(
    param: T
  ): Contract4<ARG1, ARG2, ARG3, ARG4, T>;

  fn<
    T extends (
      arg1: Convert<TSchema[ARG1]>,
      arg2: Convert<TSchema[ARG2]>,
      arg3: Convert<TSchema[ARG3]>,
      arg4: Convert<TSchema[ARG4]>
    ) => R | void,
    R
  >(
    fn: T
  ): T & ContractMeta<TSchema>;
}

interface Contract3<
  ARG1 extends string,
  ARG2 extends string,
  ARG3 extends string,
  TSchema extends { [key in ARG1 | ARG2 | ARG3]: Schema }
> {
  schema<T extends { [key in ARG1 | ARG2 | ARG3]: Schema }>(
    param: T
  ): Contract3<ARG1, ARG2, ARG3, T>;

  fn<
    T extends (
      arg1: Convert<TSchema[ARG1]>,
      arg2: Convert<TSchema[ARG2]>,
      arg3: Convert<TSchema[ARG3]>
    ) => R | void,
    R
  >(
    fn: T
  ): T & ContractMeta<TSchema>;
}

interface Contract2<
  ARG1 extends string,
  ARG2 extends string,
  TSchema extends { [key in ARG1 | ARG2]: Schema }
> {
  schema<T extends { [key in ARG1 | ARG2]: Schema }>(
    param: T
  ): Contract2<ARG1, ARG2, T>;

  fn<
    T extends (
      arg1: Convert<TSchema[ARG1]>,
      arg2: Convert<TSchema[ARG2]>
    ) => R | void,
    R
  >(
    fn: T
  ): T & ContractMeta<TSchema>;
}

interface Contract1<
  ARG1 extends string,
  TSchema extends { [key in ARG1]: Schema }
> {
  schema<T extends { [key in ARG1]: Schema }>(param: T): Contract1<ARG1, T>;

  fn<T extends (arg1: Convert<TSchema[ARG1]>) => R | void, R>(
    fn: T
  ): T & ContractMeta<TSchema>;
}

interface Contract0<TSchema extends {}> {
  schema<T extends {}>(param: T): Contract0<T>;

  fn<T extends () => R | void, R>(fn: T): T & ContractMeta<TSchema>;
}

export interface ContractMeta<TSchema> {
  getSchema(): TSchema;
  getParams(): string[];
  getSignature(): string;
}

export interface Contract {
  config(config: Partial<ContractConfig>): this;
  options(options: Partial<ContractOptions>): this;
  params(): Contract0<any>;
  params<ARG1 extends string>(arg1: ARG1): Contract1<ARG1, any>;
  params<ARG1 extends string, ARG2 extends string>(
    arg1: ARG1,
    arg2: ARG2
  ): Contract2<ARG1, ARG2, any>;
  params<ARG1 extends string, ARG2 extends string, ARG3 extends string>(
    arg1: ARG1,
    arg2: ARG2,
    arg3: ARG3
  ): Contract3<ARG1, ARG2, ARG3, any>;
  params<
    ARG1 extends string,
    ARG2 extends string,
    ARG3 extends string,
    ARG4 extends string
  >(
    arg1: ARG1,
    arg2: ARG2,
    arg3: ARG3,
    arg4: ARG4
  ): Contract4<ARG1, ARG2, ARG3, ARG4, any>;
}

export interface ContractOptions {
  removeOutput: boolean;
}

export interface ContractConfig {
  removeFields: string[];
  debug: boolean;
  depth: number;
  maxArrayLength: number;
  debugEnter: (signature: string, formattedInput: string) => void;
  debugExit: (signature: string, formattedOutput: string) => void;
}

export interface MethodEntry {
  signature: string;
  input: string;
}
