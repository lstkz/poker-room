import { validateMove } from '../../src/common/engine';
import { chainMove, getPreflopGame } from './engine-helper';

describe('validateMove', () => {
  describe('check', () => {
    it('should throw an error if check as utg-1', () => {
      const game = getPreflopGame();
      expect(() =>
        validateMove(
          {
            moveType: 'check',
          },
          game
        )
      ).toThrowError("Invalid poker move: Can't check if another player bet");
    });

    it('should throw an error if check as sb', () => {
      const game = getPreflopGame();
      chainMove(game).fold().fold();
      expect(() =>
        validateMove(
          {
            moveType: 'check',
          },
          game
        )
      ).toThrowError("Invalid poker move: Can't check if another player bet");
    });
  });

  describe('call', () => {
    xit('should throw an error if no bet', () => {});

    it('should throw an error nothing to call', () => {
      const game = getPreflopGame();
      chainMove(game).fold().fold().call();
      expect(() =>
        validateMove(
          {
            moveType: 'call',
          },
          game
        )
      ).toThrow("Invalid poker move: Can't call if nothing to call");
    });

    it('should throw an error if no enough money', () => {
      const game = getPreflopGame();
      game.players[0].money = 5;
      chainMove(game).raise(6);
      expect(() =>
        validateMove(
          {
            moveType: 'call',
          },
          game
        )
      ).toThrow('Invalid poker move: No enough money for call');
    });
  });

  describe('raise', () => {
    it('should throw an error if no amount provided', () => {
      const game = getPreflopGame();
      expect(() =>
        validateMove(
          {
            moveType: 'raise',
          },
          game
        )
      ).toThrow('Invalid poker move: Amount required for raise');
    });

    it('should throw an error if lower then min raise (raise)', () => {
      const game = getPreflopGame();
      expect(() =>
        validateMove(
          {
            moveType: 'raise',
            raiseAmount: 0.2,
          },
          game
        )
      ).toThrow('Invalid poker move: Raise amount min raise: $0.50');
    });

    it('should throw an error if lower then min raise (re-raise)', () => {
      const game = getPreflopGame();
      chainMove(game).raise(2);
      expect(() =>
        validateMove(
          {
            moveType: 'raise',
            raiseAmount: 3,
          },
          game
        )
      ).toThrow('Invalid poker move: Raise amount min raise: $3.50');
    });

    it('should throw an error if lower then min raise (re-re-raise)', () => {
      const game = getPreflopGame();
      chainMove(game).raise(2).raise(5);
      expect(() =>
        validateMove(
          {
            moveType: 'raise',
            raiseAmount: 6,
          },
          game
        )
      ).toThrow('Invalid poker move: Raise amount min raise: $8.00');
    });

    it('should throw an error if no enough money', () => {
      const game = getPreflopGame();
      expect(() =>
        validateMove(
          {
            moveType: 'raise',
            raiseAmount: 100,
          },
          game
        )
      ).toThrow('Invalid poker move: Not enough money for raise');
    });
  });
});
