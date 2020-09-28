import { ObjectID } from 'mongodb';
import { Card, GamePhaseType, MoveType } from 'shared';
import { createCollection } from '../db';

interface GameMove {
  userId: ObjectID;
  moveType: MoveType;
  amount: number;
}

interface GamePhase {
  type: GamePhaseType;
  moves: GameMove[];
  cards: Card[];
}

export interface GamePlayerInfo {
  userId: ObjectID;
  hand: [Card, Card];
  seat: number;
  money: number;
}

export interface GameModel {
  _id: ObjectID;
  isStarted: boolean;
  isDone: boolean;
  tableId: ObjectID;
  phases: GamePhase[];
  dealerPosition: number;
  players: GamePlayerInfo[];
  stakes: number;
  pot: number;
  betMap: Record<string, number>;
  currentBets: number[];
}

export const GameCollection = createCollection<GameModel>('game');
