import crypto from 'mz/crypto';
import { randomInt } from './random';

export function renameId<T extends { _id: any }>(
  obj: T
): Omit<T, '_id'> & { id: string } {
  const ret: any = { ...obj };
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
}

export async function generateSalt() {
  const bytes = await crypto.randomBytes(256);
  return bytes.toString('hex');
}

export async function hashPassword(password: string, salt: string) {
  const buffer = await crypto.pbkdf2(
    password,
    salt,
    process.env.NODE_ENV === 'production' ? 100000 : 100,
    512,
    'sha512'
  );
  return buffer.toString('hex');
}

export async function randomString(len: number) {
  const charSet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < len; i++) {
    let randomPoz = (await randomInt()) % charSet.length;
    randomString += charSet[randomPoz];
  }
  return randomString;
}

export function safeAssign<T>(obj: T, values: Partial<T>) {
  return Object.assign(obj, values);
}

export function safeKeys<T>(obj: T): Array<keyof T> {
  return Object.keys(obj) as any;
}

export async function randomItem<T>(items: T[]) {
  const idx = (await randomInt()) % items.length;
  return items[idx];
}
