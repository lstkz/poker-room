import { processNextPhase } from '../../src/common/engine';
import { chainMove, getPreflopGame, removePlayerHand } from './engine-helper';

jest.mock('../../src/common/random', () => {
  return {
    async randomInt() {
      return 0;
    },
  };
});

describe('processNextPhase', () => {
  describe('should process to next phase', () => {
    it('preflop, fold -> fold -> call -> check', async () => {
      const game = getPreflopGame();
      chainMove(game).fold().fold().call().check();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('preflop, fold -> fold -> call -> raise -> call', async () => {
      const game = getPreflopGame();
      chainMove(game).fold().fold().call().raise(5).call();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
  });
  describe('should not process to next phase', () => {});
});
