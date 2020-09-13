import { Request, Response, NextFunction } from 'express';

export type Handler = (req: Request, res: Response, next: NextFunction) => void;

export interface AppUser {
  id: number;
}

declare module 'express' {
  interface Request {
    user: AppUser;
  }
}
