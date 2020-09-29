import { getActPlayer } from '../../src/common/engine';
import { chainMove, getPreflopGame } from './engine-helper';

describe('getActPlayer', () => {
  it('should return utg-1 in pre-flop', () => {
    const game = getPreflopGame();
    const player = getActPlayer(game);
    expect(player.seat).toEqual(6);
  });

  it('should return dealer in pre-flop', () => {
    const game = getPreflopGame();
    chainMove(game).fold();
    const player = getActPlayer(game);
    expect(player.seat).toEqual(1);
  });

  it('should skip player who fold', () => {
    const game = getPreflopGame();
    chainMove(game).fold().fold().call().raise(2);
    const player = getActPlayer(game);
    expect(player.seat).toEqual(2);
  });
  it('should return utg-1 if raise by bb', () => {
    const game = getPreflopGame();
    chainMove(game).call().call().call().raise(2);
    const player = getActPlayer(game);
    expect(player.seat).toEqual(6);
  });
});
