import { ContractMeta } from 'contract';
import { Convert } from 'schema';
import loadRoutes from '../src/common/loadRoutes';
import { connect, getAllCollection, initIndexes } from '../src/db';
import { Handler } from '../src/types';

export async function initDb() {
  await connect();
  await initIndexes();
}

export async function resetDb() {
  await Promise.all(
    getAllCollection().map(collection => collection.deleteMany({}))
  );
}

type ExtractParams<T> = T extends ContractMeta<infer S>
  ? Omit<
      Convert<
        {
          [P in keyof S]: Convert<S[P]>;
        }
      >,
      'user'
    >
  : never;

export function execContract<
  T extends ((...args: any[]) => any) & ContractMeta<any>
>(contract: T, params: ExtractParams<T>): ReturnType<T> {
  const map: Record<string, Handler[]> = {};
  loadRoutes({
    post(url: string, handlers: Handler[]) {
      const signature = url.substr(1);
      map[signature] = handlers;
    },
  } as any);
  const handlers = map[contract.getSignature()];
  if (!handlers) {
    throw new Error('Signature not found: ' + contract.getSignature());
  }
  return new Promise<any>((resolve, reject) => {
    const req: any = { body: params, headers: {} };
    const res: any = {
      json: resolve,
    };
    let i = 0;
    const processNext = (err?: any) => {
      if (err) {
        reject(err);
        return;
      }
      const handler = handlers[i];
      if (!handler) {
        reject(new Error('No next handler'));
        return;
      }
      i++;
      handler(req, res, processNext);
    };
    processNext();
  }) as any;
}
