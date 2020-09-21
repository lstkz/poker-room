import { ObjectID } from 'mongodb';
import { Card, MoveType } from 'shared';
import { createCollection } from '../db';

interface GameMove {
  userId: ObjectID;
  moveType: MoveType;
  amount: number;
}

export interface GamePlayerInfo {
  userId: ObjectID;
  hand: [Card, Card];
  seat: number;
  money: number;
}

export interface GameModel {
  _id: ObjectID;
  isPlaying: boolean;
  pot: number;
  tableId: ObjectID;
  moves: GameMove[];
  dealerPosition: number;
  players: GamePlayerInfo[];
}

export const GameCollection = createCollection<GameModel>('game');
