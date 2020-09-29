import { processNextPhase } from '../../src/common/engine';
import { chainMove, getPreflopGame, removePlayerHand } from './engine-helper';

describe('processMove', () => {
  it('fold', () => {
    const game = getPreflopGame();
    chainMove(game).fold();
    expect(removePlayerHand(game)).toMatchSnapshot();
  });

  it('fold -> fold', () => {
    const game = getPreflopGame();
    chainMove(game).fold().fold();
    expect(removePlayerHand(game)).toMatchSnapshot();
  });

  it('fold -> fold -> call', () => {
    const game = getPreflopGame();
    chainMove(game).fold().fold().call();
    expect(removePlayerHand(game)).toMatchSnapshot();
  });

  it('fold -> fold -> call -> check', () => {
    const game = getPreflopGame();
    chainMove(game).fold().fold().call().check();
    expect(removePlayerHand(game)).toMatchSnapshot();
  });

  it('raise -> fold -> call -> fold', () => {
    const game = getPreflopGame();
    chainMove(game).raise(2).fold().call().fold();
    expect(removePlayerHand(game)).toMatchSnapshot();
  });

  it('raise -> reraise -> fold -> fold -> call', () => {
    const game = getPreflopGame();
    chainMove(game).raise(2).raise(5).fold().fold().call();
    expect(removePlayerHand(game)).toMatchSnapshot();
  });

  it('no min raise on flop', async () => {
    const game = getPreflopGame();
    chainMove(game).raise(4).call().call().call();
    await processNextPhase(game);
    expect(() => chainMove(game).raise(0.5)).not.toThrow();
  });
});
