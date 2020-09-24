import crypto from 'mz/crypto';

export async function randomInt() {
  return (await crypto.randomBytes(4)).readUInt32BE(0);
}
