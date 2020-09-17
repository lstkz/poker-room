import { getMe } from '../src/contracts/user/getMe';
import { login } from '../src/contracts/user/login';
import { register } from '../src/contracts/user/register';
import { disconnect } from '../src/db';
import { execContract, initDb, resetDb } from './helper';

beforeAll(async () => {
  await initDb();
});

afterAll(disconnect);

beforeEach(resetDb);

describe('register', () => {
  test.each([
    [
      "'values.username' length must be at least 2 characters long.",
      { username: 'a', password: 'foo' },
    ],
    [
      "Validation error: 'values.username' length must be less than or equal to 10 characters long.",
      { username: '1234455555555', password: 'foo' },
    ],
    [
      "Validation error: 'values.username' must match regex /^[a-z0-9]+$/.",
      { username: '$@$@$@', password: 'foo' },
    ],
    [
      "Validation error: 'values.username' must match regex /^[a-z0-9]+$/.",
      { username: 'abc$', password: 'foo' },
    ],
    [
      "Validation error: 'values.password' length must be at least 3 characters long.",
      { username: 'aabc', password: '1' },
    ],
  ])('validation: throw %s for %j', async (error, values) => {
    await expect(
      execContract(register, {
        values,
      })
    ).rejects.toThrow(error);
  });

  it('should register successfully', async () => {
    const ret = await execContract(register, {
      values: { username: 'foo', password: 'abc' },
    });
    expect(ret.accessToken).toBeDefined();
    expect(ret.user.username).toEqual('foo');
  });

  it('should throw an error if username is already taken', async () => {
    await execContract(register, {
      values: { username: 'foo', password: 'abc' },
    });
    await expect(
      execContract(register, {
        values: { username: 'foo', password: 'abc' },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Username is already taken"`);
  });

  it('should throw an error if username is already taken (race condition)', async () => {
    await expect(
      Promise.all([
        execContract(register, {
          values: { username: 'foo', password: 'abc' },
        }),
        execContract(register, {
          values: { username: 'foo', password: 'abc' },
        }),
      ])
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Username is already taken"`);
  });
});

describe('login', () => {
  it('should register and login', async () => {
    await execContract(register, {
      values: { username: 'foo', password: 'abc' },
    });
    const ret = await execContract(login, {
      values: { username: 'foo', password: 'abc' },
    });
    expect(ret.accessToken).toBeDefined();
    expect(ret.user.username).toEqual('foo');
  });
  it('should throw an error if does not exist', async () => {
    await expect(
      execContract(login, {
        values: { username: 'foo', password: 'abc' },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid username or password"`
    );
  });
  it('should throw an error if invalid password', async () => {
    await execContract(register, {
      values: { username: 'foo', password: 'abc' },
    });
    await expect(
      execContract(login, {
        values: { username: 'foo', password: 'abc2' },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid username or password"`
    );
  });
});

describe('getMe', () => {
  it('should return a user if valid token', async () => {
    const auth = await execContract(register, {
      values: { username: 'foo', password: 'abc' },
    });
    const user = await execContract(getMe, {}, auth.accessToken);
    expect(user?.username).toEqual('foo');
  });

  it('should throw error if invalid token', async () => {
    await expect(execContract(getMe, {}, 'abasd')).rejects.toThrow(
      'invalid token'
    );
  });
});
