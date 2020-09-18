import dotenv from 'dotenv';
import Path from 'path';

dotenv.config({
  path: Path.join(__dirname, '../../../.env'),
});

export const PORT = process.env.PORT || 3000;

if (!process.env.MONGO_URL) {
  throw new Error('MONGO_URL is not set');
}

export const MONGO_URL = process.env.MONGO_URL;

if (!process.env.MONGO_DB_NAME) {
  throw new Error('MONGO_DB_NAME is not set');
}

export const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

export const LOG_LEVEL: 'debug' | 'info' =
  process.env.NODE_ENV === 'development' ? 'debug' : 'info';

export const INITIAL_BANKROLL = 1000;
export const MIN_ENTRY_PERCENT = 0.2;
