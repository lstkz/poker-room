import { processNextPhase } from '../../src/common/engine';
import {
  chainMove,
  getFlopGame,
  getPreflopGame,
  getRiverGame,
  getTurnGame,
  removePlayerHand,
} from './engine-helper';

jest.mock('../../src/common/random', () => {
  return {
    async randomInt() {
      return 0;
    },
  };
});

describe('processNextPhase', () => {
  describe('should process to next phase', () => {
    it('preflop, call -> call -> call -> check', async () => {
      const game = getPreflopGame();
      chainMove(game).call().call().call().check();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
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
    it('flop, fold -> fold -> raise -> call', async () => {
      const game = await getFlopGame();
      chainMove(game).fold().fold().raise(3).call();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('flop, fold -> fold -> raise -> raise -> call', async () => {
      const game = await getFlopGame();
      chainMove(game).fold().fold().raise(3).raise(6).call();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('turn, fold -> fold -> raise -> call', async () => {
      const game = await getTurnGame();
      chainMove(game).fold().fold().raise(3).call();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('river, fold -> fold -> raise -> call', async () => {
      const game = await getRiverGame();
      chainMove(game).fold().fold().raise(3).call();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
  });
  describe('should not process to next phase', () => {
    it('preflop, call -> call', async () => {
      const game = getPreflopGame();
      chainMove(game).call().call();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('preflop, call -> call -> call', async () => {
      const game = getPreflopGame();
      chainMove(game).call().call().call();
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('preflop, fold -> fold -> call -> raise -> raise', async () => {
      const game = getPreflopGame();
      chainMove(game).fold().fold().call().raise(5).raise(10);
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('flop, fold -> fold -> raise -> raise -> raise', async () => {
      const game = await getFlopGame();
      chainMove(game).fold().fold().raise(2).raise(5).raise(10);
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('turn, fold -> fold -> raise -> raise -> raise', async () => {
      const game = await getTurnGame();
      chainMove(game).fold().fold().raise(2).raise(5).raise(10);
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
    it('river, fold -> fold -> raise -> raise -> raise', async () => {
      const game = await getRiverGame();
      chainMove(game).fold().fold().raise(2).raise(5).raise(10);
      await processNextPhase(game);
      expect(removePlayerHand(game)).toMatchSnapshot();
    });
  });
});
