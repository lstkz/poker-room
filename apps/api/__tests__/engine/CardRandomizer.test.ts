import * as R from 'remeda';
import { CardRandomizer } from '../../src/common/engine';

jest.mock('../../src/common/random', () => {
  return {
    async randomInt() {
      return 0;
    },
  };
});

describe('CardRandomizer', () => {
  it('should return all cards', () => {
    const cr = new CardRandomizer();
    const cards = cr.getLeftCards();
    expect(cards).toHaveLength(52);
    expect(cards).toMatchSnapshot();
  });

  it('should random cards (sync)', async () => {
    const cr = new CardRandomizer();
    const cards = new Set<string>();
    for (let i = 0; i < 52; i++) {
      const card = await cr.randomNextCard();
      cards.add(card.card + card.color);
    }
    expect(cards.size).toEqual(52);
  });

  it('should random cards (async)', async () => {
    const cr = new CardRandomizer();
    const cards = new Set<string>();
    await Promise.all(
      R.range(0, 52).map(async () => {
        const card = await cr.randomNextCard();
        cards.add(card.card + card.color);
      })
    );
    expect(cards.size).toEqual(52);
  });

  it('should not random initial cards', async () => {
    const cr = new CardRandomizer([
      {
        card: 2,
        color: 'c',
      },
      {
        card: 2,
        color: 'd',
      },
    ]);
    const cards = [
      await cr.randomNextCard(),
      await cr.randomNextCard(),
      await cr.randomNextCard(),
    ];
    expect(cards).toMatchInlineSnapshot(`
      Array [
        Object {
          "card": 2,
          "color": "h",
        },
        Object {
          "card": 2,
          "color": "s",
        },
        Object {
          "card": 3,
          "color": "c",
        },
      ]
    `);
  });
});
