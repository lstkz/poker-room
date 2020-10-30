import * as R from 'remeda';
import { Card, getMinRaiseAmount, MoveType } from 'shared';
import { GameModel } from '../collections/Game';
import { InvalidMoveError, UnreachableCaseError } from './errors';
import { getBlindPlayerFromGame } from './helper';
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
  if (!game.players.length) {
    return null;
  }
  const phase = R.last(game.phases)!;
  const lastMove = R.last(phase.moves);
  const getPlayer = (idx: number) => game.players[idx % game.players.length];

  const skipPlayers = R.pipe(
    game.phases,
    R.flatMap(p => p.moves),
    R.filter(x => x.moveType === 'all-in' || x.moveType === 'fold'),
    R.map(x => x.userId.toHexString()),
    x => new Set(x)
  );

  if (lastMove) {
    const lastPlayerIdx = game.players.findIndex(x =>
      x.userId.equals(lastMove.userId)
    );
    for (let i = 1; i < game.players.length; i++) {
      const nextPlayerIdx = (lastPlayerIdx + i) % game.players.length;
      const player = game.players[nextPlayerIdx];
      if (!skipPlayers.has(player.userId.toHexString())) {
        return player;
      }
    }
  } else {
    const dealerPlayerIdx = game.players.findIndex(
      x => x.seat === game.dealerPosition
    );
    const posDiff =
      phase.type === 'pre-flop'
        ? 3 // utg-1
        : 1; // sb;
    for (let i = 0; i < game.players.length; i++) {
      const player = getPlayer(dealerPlayerIdx + posDiff + i);
      if (!skipPlayers.has(player.userId.toHexString())) {
        return player;
      }
    }
  }
  throw new Error('Cannot get next act player');
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
  validateMove(values, game);
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
    return 0;
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
  const skipPlayers = R.pipe(
    game.phases,
    R.flatMap(x => x.moves),
    R.filter(x => x.moveType === 'all-in' || x.moveType === 'fold'),
    R.map(x => x.userId.toHexString()),
    x => new Set(x)
  );
  const playingPlayers = R.pipe(
    game.players,
    R.map(x => x.userId.toHexString()),
    R.filter(x => !skipPlayers.has(x))
  );
  if (game.phases.length === 1) {
    const { bbPlayer } = getBlindPlayerFromGame(game);
    const bbHasMove =
      game.phases.length > 1 ||
      game.phases[0].moves.some(x => x.userId.equals(bbPlayer.userId));
    if (!bbHasMove) {
      return;
    }
  }
  if (
    currentBet &&
    !playingPlayers.every(playerId => game.betMap[playerId] === currentBet)
  ) {
    return;
  }
  const cr = getCardRandomizer(game);
  let sum = 0;
  const playerMap = R.indexBy(game.players, x => x.userId);
  Object.keys(game.betMap).forEach(userId => {
    const bet = game.betMap[userId];
    sum += bet;
    playerMap[userId].money -= bet;
  });
  game.pot += sum;
  game.betMap = {};
  game.currentBets = [];

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
  }
  // flop -> turn
  else if (game.phases.length === 2) {
    game.phases.push({
      moves: [],
      type: 'turn',
      cards: await Promise.all([cr.randomNextCard()]),
    });
  }
  // turn -> river
  else if (game.phases.length === 3) {
    game.phases.push({
      moves: [],
      type: 'river',
      cards: await Promise.all([cr.randomNextCard()]),
    });
  }
  // river -> showdown
  else if (game.phases.length === 4) {
    game.isDone = true;
  }
}
