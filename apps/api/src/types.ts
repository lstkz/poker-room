import { Request, Response, NextFunction } from 'express';
import { User } from 'shared';

export type Handler = (req: Request, res: Response, next: NextFunction) => void;

export interface AppUser extends User {}

declare module 'express' {
  interface Request {
    user: AppUser;
  }
}
