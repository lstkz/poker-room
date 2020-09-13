import * as R from 'remeda';
import Path from 'path';
import fs from 'fs';
import { MONGO_URL, MONGO_DB_NAME } from './config';
import {
  MongoClient,
  CollectionAggregationOptions,
  AggregationCursor,
  MongoCallback,
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
} from 'mongodb';

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

function getClient() {
  if (!client) {
    throw new Error('client is not set');
  }
  return client;
}

interface DbCollection<TSchema> {
  aggregate<T>(
    pipeline?: object[],
    options?: CollectionAggregationOptions,
    callback?: MongoCallback<AggregationCursor<T>>
  ): AggregationCursor<T>;
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
  ): Cursor<T>;
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
  update(model: TSchema, fields: Array<keyof TSchema>): Promise<void>;
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

  const ret: DbCollection<T> = {
    aggregate(...args) {
      return _getCollection().aggregate(...args);
    },
    insertOne(...args) {
      return _getCollection().insertOne(...args);
    },
    insertMany(...args) {
      return _getCollection().insertMany(...args);
    },
    countDocuments(...args) {
      return _getCollection().countDocuments(...args);
    },
    find(...args) {
      return _getCollection().find(...args);
    },
    findOne(...args) {
      return _getCollection().findOne(...args);
    },
    async findOneOrThrow(...args) {
      const ret = await _getCollection().findOne(...args);
      if (!ret) {
        throw new Error(
          `Entity ${JSON.stringify(args[0])} not found in ${collectionName}`
        );
      }
      return ret;
    },
    findOneAndDelete(...args) {
      return _getCollection().findOneAndDelete(...args);
    },
    findOneAndReplace(...args) {
      return _getCollection().findOneAndReplace(...args);
    },
    findOneAndUpdate(...args) {
      return _getCollection().findOneAndUpdate(...args);
    },
    deleteMany(...args) {
      return _getCollection().deleteMany(...args);
    },
    deleteOne(...args) {
      return _getCollection().deleteOne(...args);
    },
    async update(model: any, fields) {
      if (model._id == null) {
        throw new Error('_id not defined');
      }
      await this.findOneAndUpdate(
        {
          _id: model._id,
        },
        {
          $set: R.pick(model, fields),
        }
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
