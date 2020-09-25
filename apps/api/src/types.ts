import { Request, Response, NextFunction } from 'express';
import { User } from 'shared';

export type Handler = (req: Request, res: Response, next: NextFunction) => void;

export interface AppUser extends User {}

declare module 'express' {
  interface Request {
    user: AppUser;
  }
}

export type AppEvent =
  | {
      type: 'PLAYER_JOINED';
      payload: { tableId: string; userId: string };
    }
  | {
      type: 'GAME_STARTED';
      payload: { tableId: string; gameId: string };
    }
  | {
      type: 'GAME_UPDATED';
      payload: { gameId: string };
    };

type ExtractType<T> = T extends { type: infer S } ? S : never;

export type AppEventType = ExtractType<Pick<AppEvent, 'type'>>;
