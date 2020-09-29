import * as R from 'remeda';
import { ContractMeta } from 'contract';
import { ObjectID } from 'mongodb';
import { Convert } from 'schema';
import { AccessTokenCollection } from '../src/collections/AccessToken';
import { TableCollection } from '../src/collections/Table';
import { UserCollection } from '../src/collections/User';
import loadRoutes from '../src/common/loadRoutes';
import { INITIAL_BANKROLL } from '../src/config';
import { connect, getAllCollection, initIndexes } from '../src/db';
import { Handler } from '../src/types';
import { GameCollection } from '../src/collections/Game';
import { joinTable, joinTableEvent } from '../src/contracts/table/joinTable';

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

let routeMap: Record<string, Handler[]> = null!;

export function execContract<
  T extends ((...args: any[]) => any) & ContractMeta<any>
>(contract: T, params: ExtractParams<T>, accessToken?: string): ReturnType<T> {
  if (!routeMap) {
    routeMap = {};
    loadRoutes({
      post(url: string, handlers: Handler[]) {
        const signature = url.substr(1);
        routeMap[signature] = handlers;
      },
    } as any);
  }
  const handlers = routeMap[contract.getSignature()];
  if (!handlers) {
    throw new Error('Signature not found: ' + contract.getSignature());
  }
  return new Promise<any>((resolve, reject) => {
    const req: any = {
      body: params,
      headers: {},
      header(str: string) {
        if (str === 'x-token') {
          return accessToken;
        }
        return undefined;
      },
    };
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

export function getTestUserId(nr: number) {
  return '00000000000000000000000' + nr;
}

export async function generateSampleUsers() {
  const nrs = R.range(1, 10);
  await UserCollection.insertMany(
    nrs.map(nr => {
      return {
        _id: ObjectID.createFromHexString(getTestUserId(nr)),
        username: 'user' + nr,
        bankroll: INITIAL_BANKROLL,
        passwordHash: 'salt',
        salt: 'salt',
        isAdmin: nr === 1,
      };
    })
  );
  await AccessTokenCollection.insertMany(
    nrs.map(nr => {
      return {
        _id: 'token_' + nr,
        userId: getTestUserId(nr),
      };
    })
  );
}

export function getTestTableId(nr: number) {
  return '10000000000000000000000' + nr;
}

export function getTestGameId(nr: number) {
  return '20000000000000000000000' + nr;
}

export async function generateSampleTables() {
  await TableCollection.insertMany(
    R.range(1, 3).map(nr => ({
      _id: ObjectID.createFromHexString(getTestTableId(nr)),
      maxSeats: 6,
      name: 't' + nr,
      players: [],
      stakes: 50,
      gameId: ObjectID.createFromHexString(getTestGameId(nr)),
    }))
  );
  await GameCollection.insertMany(
    R.range(1, 3).map(nr => ({
      _id: ObjectID.createFromHexString(getTestGameId(nr)),
      isStarted: false,
      isDone: false,
      tableId: ObjectID.createFromHexString(getTestTableId(nr)),
      pot: 0,
      stakes: 0,
      currentBets: [],
      players: [],
      phases: [{ type: 'pre-flop', moves: [], cards: [] }],
      dealerPosition: -1,
      betMap: {},
      maxSeats: 6,
    }))
  );
}

export function getId(nr: number) {
  return ObjectID.createFromHexString('00000000000000000000000' + nr);
}

export async function joinTableWithDispatch({
  userNr,
  seat,
  tableNr,
  noDispatch,
}: {
  userNr: number;
  seat: number;
  tableNr: number;
  noDispatch?: boolean;
}) {
  await execContract(
    joinTable,
    {
      values: {
        money: 50,
        seat: seat,
        tableId: getTestTableId(tableNr),
      },
    },
    'token_' + userNr
  );
  if (!noDispatch) {
    await joinTableEvent.options.handler({
      tableId: getTestTableId(tableNr),
      userId: getTestUserId(userNr),
    });
  }
}
