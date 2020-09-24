import * as R from 'remeda';
import { Card, MoveType } from 'shared';
import { GameModel } from '../collections/Game';
import { InvalidMoveError, UnreachableCaseError } from './errors';
import { randomInt } from './random';

export class CardRandomizer {
  private cards: Card[] = [];

  constructor(usedCards: Card[] = []) {
    const allCards = [2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K', 'A'] as const;
    const allColors = ['c', 'd', 'h', 's'] as const;
    const usedSet = new Set<string>(
      usedCards.map(card => card.card + card.color)
    );
    allCards.forEach(card => {
      allColors.forEach(color => {
        const key = card + color;
        if (!usedSet.has(key)) {
          this.cards.push({ card, color });
        }
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

export function getActPlayer(game: GameModel) {
  const phase = R.last(game.phases)!;
  const lastMove = R.last(phase.moves);
  const getPlayer = (idx: number) => game.players[idx % game.players.length];

  if (lastMove) {
    const lastPlayerIdx = game.players.findIndex(x =>
      x.userId.equals(lastMove.userId)
    );
    const skipPlayers = new Set(
      phase.moves
        .filter(x => x.moveType === 'all-in' || x.moveType === 'fold')
        .map(x => x.userId.toHexString())
    );
    for (let i = 1; i < game.players.length; i++) {
      const nextPlayerIdx = (lastPlayerIdx + i) % game.players.length;
      const player = game.players[nextPlayerIdx];
      if (!skipPlayers.has(player.userId.toHexString())) {
        return player;
      }
    }
    throw new Error('Cannot get next act player');
  } else {
    const dealerPlayerIdx = game.players.findIndex(
      x => x.seat === game.dealerPosition
    );
    const posDiff =
      phase.type === 'pre-flop'
        ? 3 // utg-1
        : 1; // sb;
    return getPlayer(dealerPlayerIdx + posDiff);
  }
}

export function getBB(stakesOrGame: number | GameModel) {
  const stakes =
    typeof stakesOrGame === 'number' ? stakesOrGame : stakesOrGame.stakes;
  return stakes / 100;
}

export function getMinRaiseAmount(game: GameModel) {
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

export function validateMove(
  values: {
    moveType: MoveType;
    raiseAmount?: number | undefined;
  },
  game: GameModel
) {
  const player = getActPlayer(game);
  const currentBet = R.last(game.currentBets);
  switch (values.moveType) {
    case 'fold':
      // always can fold
      break;
    case 'all-in':
      // always can all-in
      break;
    case 'check':
      {
        if (currentBet) {
          if (game.betMap[player.userId.toHexString()] !== currentBet) {
            throw new InvalidMoveError("Can't check if another player bet");
          }
        }
      }
      break;
    case 'call':
      {
        if (!currentBet) {
          throw new InvalidMoveError("Can't call if no bet");
        }
        if (game.betMap[player.userId.toHexString()] === currentBet) {
          throw new InvalidMoveError("Can't call if nothing to call");
        }
        if (player.money < currentBet) {
          throw new InvalidMoveError('No enough money for call');
        }
      }
      break;
    case 'raise':
      {
        if (!values.raiseAmount) {
          throw new InvalidMoveError('Amount required for raise');
        }
        const minRaise = getMinRaiseAmount(game);
        if (values.raiseAmount < minRaise) {
          throw new InvalidMoveError(
            `Raise amount min raise: $${minRaise.toFixed(2)}`
          );
        }
        if (values.raiseAmount >= player.money) {
          throw new InvalidMoveError('Not enough money for raise');
        }
      }
      break;
    default:
      new UnreachableCaseError(values.moveType);
  }
}

export function processMove(
  values: {
    moveType: MoveType;
    raiseAmount?: number | undefined;
  },
  game: GameModel
) {
  const phase = R.last(game.phases)!;
  const player = getActPlayer(game);
  const currentBet = R.last(game.currentBets)!;
  switch (values.moveType) {
    case 'fold':
      {
        phase.moves.push({
          amount: 0,
          moveType: 'fold',
          userId: player.userId,
        });
      }
      break;
    case 'all-in':
      {
        phase.moves.push({
          amount: player.money,
          moveType: 'all-in',
          userId: player.userId,
        });
        game.betMap[player.userId.toHexString()] = player.money;
        game.currentBets.push(player.money);
      }
      break;
    case 'check':
      {
        phase.moves.push({
          amount: 0,
          moveType: 'check',
          userId: player.userId,
        });
      }
      break;
    case 'call':
      {
        phase.moves.push({
          amount: currentBet,
          moveType: 'call',
          userId: player.userId,
        });
        game.betMap[player.userId.toHexString()] = currentBet;
      }
      break;
    case 'raise':
      {
        const raiseAmount = values.raiseAmount!;
        phase.moves.push({
          amount: raiseAmount,
          moveType: 'raise',
          userId: player.userId,
        });
        game.betMap[player.userId.toHexString()] = raiseAmount;
        game.currentBets.push(raiseAmount);
      }
      break;
    default:
      new UnreachableCaseError(values.moveType);
  }
}

function getCurrentBet(game: GameModel) {
  if (!game.currentBets.length) {
    return getBB(game);
  }
  return R.last(game.currentBets);
}

export function getCardRandomizer(game: GameModel) {
  const used: Card[] = [];
  game.players.forEach(player => {
    used.push(...player.hand);
  });
  game.phases.forEach(phase => {
    used.push(...phase.cards);
  });
  return new CardRandomizer(used);
}

export async function processNextPhase(game: GameModel) {
  const currentBet = getCurrentBet(game);
  const playingPlayers = R.pipe(
    R.last(game.phases)!.moves,
    R.filter(x => x.moveType !== 'all-in' && x.moveType !== 'fold'),
    R.map(x => x.userId.toHexString())
  );
  if (!playingPlayers.every(playerId => game.betMap[playerId] === currentBet)) {
    return;
  }
  const cr = getCardRandomizer(game);
  // preflop -> flop
  if (game.phases.length === 1) {
    game.phases.push({
      moves: [],
      type: 'flop',
      cards: await Promise.all([
        cr.randomNextCard(),
        cr.randomNextCard(),
        cr.randomNextCard(),
      ]),
    });
    let sum = 0;
    const playerMap = R.indexBy(game.players, x => x.userId);
    Object.keys(game.betMap).forEach(userId => {
      const bet = game.betMap[userId];
      sum += bet;
      playerMap[userId].money -= bet;
    });
    game.pot += sum;
    game.betMap = {};
  }
}
