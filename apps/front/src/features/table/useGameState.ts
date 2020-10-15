import React from 'react';
import * as R from 'remeda';
import { Card, Game, GamePlayerInfo, Table, TablePlayer, User } from 'shared';

export function useGameState(
  user: User,
  table: Table | null,
  game: Game | null
): {
  cards: Card[];
  foldedMap: Record<string, boolean>;
  gameSeatMap: Record<string, GamePlayerInfo>;
  tableSeatMap: Record<string, TablePlayer>;
  currentPlayer?: GamePlayerInfo | undefined;
} {
  return React.useMemo(() => {
    if (!game || !table) {
      return {
        cards: [],
        foldedMap: {},
        gameSeatMap: {},
        tableSeatMap: {},
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
      gameSeatMap: R.indexBy(game.players, x => x.seat),
      tableSeatMap: R.indexBy(table.players, x => x.seat),
      currentPlayer,
    };
  }, [game]);
}
