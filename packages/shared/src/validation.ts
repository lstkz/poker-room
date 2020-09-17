import { S } from 'schema';

export const RegisterKeysSchema = {
  username: S.string()
    .min(2)
    .max(10)
    .trim()
    .regex(/^[a-z0-9]+$/),
  password: S.string().min(3),
};
