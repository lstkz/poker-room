import { LOG_LEVEL } from '../config';

export const logger = {
  error(...args: any) {
    console.error('ERROR:', ...args);
  },
  debug(...args: any) {
    if (LOG_LEVEL === 'debug') {
      console.log('DEBUG:', ...args);
    }
  },
  info(...args: any) {
    console.log('INFO:', ...args);
  },
};
