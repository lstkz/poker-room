import * as R from 'remeda';
import Path from 'path';
import fs from 'fs';
import { AsyncLocalStorage } from 'async_hooks';
import { MONGO_URL, MONGO_DB_NAME } from './config';
import {
  MongoClient,
  FilterQuery,
  MongoCountPreferences,
  FindOneOptions,
  FindOneAndDeleteOption,
  FindOneAndUpdateOption,
  UpdateQuery,
  FindOneAndReplaceOption,
  CollectionInsertOneOptions,
  InsertOneWriteOpResult,
  Cursor,
  FindAndModifyWriteOpResultObject,
  IndexSpecification,
  DeleteWriteOpResultObject,
  CommonOptions,
  InsertWriteOpResult,
  CollectionInsertManyOptions,
  OptionalId,
  WithId,
  ClientSession,
} from 'mongodb';

const dbSessionStorage = new AsyncLocalStorage<ClientSession>();

let client: MongoClient | null = null;

export async function disconnect() {
  client?.close();
}

export async function connect() {
  if (!client || !client.isConnected()) {
    client = new MongoClient(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  await client.connect();

  return client;
}

async function startSession() {
  if (!client) {
    throw new Error('Not connected');
  }
  return client.startSession();
}

export async function withTransaction<T extends () => Promise<R>, R>(fn: T) {
  const session = await startSession();
  try {
    return await dbSessionStorage.run(session, async () => {
      return session.withTransaction(fn);
    });
  } finally {
    session.endSession();
  }
}

function getClient() {
  if (!client) {
    throw new Error('client is not set');
  }
  return client;
}

interface DbCollection<TSchema> {
  // aggregate<T>(
  //   pipeline?: object[],
  //   options?: CollectionAggregationOptions
  // ): AggregationCursor<T>;
  insertOne(
    docs: OptionalId<TSchema>,
    options?: CollectionInsertOneOptions
  ): Promise<InsertOneWriteOpResult<WithId<TSchema>>>;
  insertMany(
    docs: Array<OptionalId<TSchema>>,
    options?: CollectionInsertManyOptions
  ): Promise<InsertWriteOpResult<WithId<TSchema>>>;
  countDocuments(
    query?: FilterQuery<TSchema>,
    options?: MongoCountPreferences
  ): Promise<number>;
  find<T = TSchema>(
    query: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<Cursor<T>>;
  findAll<T = TSchema>(
    query: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<T[]>;
  findOne<T = TSchema>(
    filter: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<T | null>;
  findOneOrThrow<T = TSchema>(
    filter: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>
  ): Promise<T>;
  findOneAndDelete(
    filter: FilterQuery<TSchema>,
    options?: FindOneAndDeleteOption<TSchema>
  ): Promise<FindAndModifyWriteOpResultObject<TSchema>>;
  findOneAndReplace(
    filter: FilterQuery<TSchema>,
    replacement: object,
    options?: FindOneAndReplaceOption<TSchema>
  ): Promise<FindAndModifyWriteOpResultObject<TSchema>>;
  findOneAndUpdate(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema> | TSchema,
    options?: FindOneAndUpdateOption<TSchema>
  ): Promise<FindAndModifyWriteOpResultObject<TSchema>>;
  deleteMany(
    filter: FilterQuery<TSchema>,
    options?: CommonOptions
  ): Promise<DeleteWriteOpResultObject>;
  deleteOne(
    filter: FilterQuery<TSchema>,
    options?: CommonOptions
  ): Promise<DeleteWriteOpResultObject>;
  update(
    model: TSchema,
    fields: Array<keyof TSchema>,
    options?: CommonOptions
  ): Promise<void>;
}

export function createCollection<T>(
  collectionName: string,
  indexes?: IndexSpecification[]
): DbCollection<T> {
  const _getCollection = () => {
    const client = getClient();
    const db = client.db(
      process.env.JEST_WORKER_ID
        ? `jest-${process.env.JEST_WORKER_ID}`
        : MONGO_DB_NAME
    );
    return db.collection<T>(collectionName);
  };

  const exec = async (
    name: Exclude<keyof DbCollection<any>, 'findOneOrThrow' | 'findAll'>,
    n: 2 | 3,
    args: any[]
  ) => {
    if (n === 2) {
      if (!args[1]) {
        args[1] = {};
      }
    } else {
      if (!args[2]) {
        args[2] = {};
      }
    }
    args[args.length - 1]!.session = await dbSessionStorage.getStore();
    const collection = _getCollection();
    const fn: any = collection[name].bind(collection);
    return fn(...args);
  };

  const ret: DbCollection<T> = {
    insertOne(...args) {
      return exec('insertOne', 2, args);
    },
    insertMany(...args) {
      return exec('insertMany', 2, args);
    },
    countDocuments(...args) {
      return exec('countDocuments', 2, args);
    },
    find(...args) {
      return exec('find', 2, args);
    },
    async findAll(...args) {
      return (await this.find(...args)).toArray();
    },
    findOne(...args) {
      return exec('findOne', 2, args);
    },
    async findOneOrThrow(...args) {
      const ret = exec('findOne', 2, args);
      if (!ret) {
        throw new Error(
          `Entity ${JSON.stringify(args[0])} not found in ${collectionName}`
        );
      }
      return ret;
    },
    findOneAndDelete(...args) {
      return exec('findOneAndDelete', 2, args);
    },
    findOneAndReplace(...args) {
      return exec('findOneAndReplace', 3, args);
    },
    findOneAndUpdate(...args) {
      return exec('findOneAndUpdate', 3, args);
    },
    deleteMany(...args) {
      return exec('deleteMany', 2, args);
    },
    deleteOne(...args) {
      return exec('deleteOne', 2, args);
    },
    async update(model: any, fields, options) {
      if (model._id == null) {
        throw new Error('_id not defined');
      }
      await this.findOneAndUpdate(
        {
          _id: model._id,
        },
        {
          $set: R.pick(model, fields),
        },
        options
      );
    },
  };

  (ret as any).initIndex = () => {
    if (!indexes || indexes.length === 0) {
      return;
    }
    return _getCollection().createIndexes(indexes);
  };

  return ret;
}

export function getAllCollection(): Array<DbCollection<unknown>> {
  return R.pipe(
    fs.readdirSync(Path.join(__dirname, './collections')),
    R.map(name => Object.values(require('./collections/' + name))),
    R.flatten
  ) as any;
}

export function initIndexes() {
  return Promise.all(
    getAllCollection().map((collection: any) => collection.initIndex())
  );
}
