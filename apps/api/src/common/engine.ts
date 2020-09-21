import { Card } from 'shared';
import { randomInt } from './helper';

export class CardRandomizer {
  private cards: Card[] = [];

  constructor() {
    const allCards = [2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K', 'A'] as const;
    const allColors = ['c', 'd', 'h', 's'] as const;
    allCards.forEach(card => {
      allColors.forEach(color => {
        this.cards.push({ card, color });
      });
    });
  }

  getLeftCards() {
    return this.cards;
  }

  async randomNextCard(): Promise<Card> {
    if (!this.cards.length) {
      throw new Error('No cards left');
    }
    const idx = (await randomInt()) % this.cards.length;
    const ret = this.cards.splice(idx, 1);
    if (!ret.length) {
      return this.randomNextCard();
    }
    return ret[0];
  }
}
