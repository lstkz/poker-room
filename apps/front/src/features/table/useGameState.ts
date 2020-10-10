import React from 'react';
import * as R from 'remeda';
import { Card, Game, GamePlayerInfo, User } from 'shared';

export function useGameState(
  user: User,
  game: Game | null
): {
  cards: Card[];
  foldedMap: Record<string, boolean>;
  seatMap: Record<string, GamePlayerInfo>;
  currentPlayer?: GamePlayerInfo | undefined;
} {
  return React.useMemo(() => {
    if (!game) {
      return {
        cards: [],
        foldedMap: {},
        seatMap: {},
      };
    }

    const foldedMap: Record<string, boolean> = {};
    game.phases.forEach(phase => {
      phase.moves.forEach(move => {
        if (move.moveType === 'fold') {
          foldedMap[move.userId] = true;
        }
      });
    });
    const currentPlayer = game.players.find(x => x.user.id === user.id);
    return {
      cards: R.flatMap(game.phases, item => item.cards),
      foldedMap,
      seatMap: R.indexBy(game.players, x => x.seat),
      currentPlayer,
    };
  }, [game]);
}
