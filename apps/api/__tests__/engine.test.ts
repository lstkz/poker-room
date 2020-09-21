import * as R from 'remeda';
import { CardRandomizer } from '../src/common/engine';

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
});
