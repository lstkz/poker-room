import { randomString } from '../src/common/helper';

describe('randomString', () => {
  it('should random a string', async () => {
    const str = await randomString(20);
    expect(str).toHaveLength(20);
  });
});
