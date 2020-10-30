import * as R from 'remeda';

export function getBB(stakesOrGame: number | { stakes: number }) {
  const stakes =
    typeof stakesOrGame === 'number' ? stakesOrGame : stakesOrGame.stakes;
  return stakes / 100;
}

export function getMinRaiseAmount<
  T extends {
    stakes: number;
    currentBets: number[];
  }
>(game: T) {
  const bb = getBB(game);
  if (!game.currentBets.length) {
    return bb;
  }
  if (game.currentBets.length === 1) {
    // bb: 0.5$
    // raise: 5$
    // min re-raise: 9.5$
    return game.currentBets[0] * 2 - bb;
  }
  const last = R.last(game.currentBets)!;
  const diff = last - game.currentBets[game.currentBets.length - 2];
  return last + diff;
}
