import { ObjectID } from 'mongodb';
import { createCollection } from '../db';

interface TablePlayer {
  userId: ObjectID;
  seat: number;
  money: number;
}

export interface TableModel {
  _id: ObjectID;
  name: string;
  // NL 50 -> 0.25/0.50
  stakes: number;
  maxSeats: number;
  players: TablePlayer[];
  gameId: ObjectID | null;
}

export const TableCollection = createCollection<TableModel>('table', [
  {
    key: {
      name: 1,
    },
    unique: true,
  },
]);
