import { getActPlayer, processNextPhase } from '../../src/common/engine';
import { chainMove, getFlopGame, getPreflopGame } from './engine-helper';

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
  it('should skip player who fold (turn)', async () => {
    const game = await getFlopGame();
    chainMove(game).fold().check().check().check();
    await processNextPhase(game);
    expect(game.phases).toHaveLength(3);
    const player = getActPlayer(game);
    expect(player.seat).toEqual(4);
  });
});
