import { ObjectID } from 'mongodb';
import { Card } from 'shared';
import { GameModel, GamePlayerInfo } from '../../src/collections/Game';
import { processMove } from '../../src/common/engine';
import { getId } from '../helper';

function getCardFromSymbol(cardSymbol: string) {
  return {
    card:
      cardSymbol[0] >= '2' && cardSymbol[0] <= '9'
        ? Number(cardSymbol[0])
        : cardSymbol[0],
    color: cardSymbol[1],
  } as Card;
}

function _getPlayer(seat: number): GamePlayerInfo {
  const cards: Card[] = [
    '2c',
    '2d',
    '2h',
    '2c',
    '3c',
    '3d',
    '3h',
    '3c',
    '4c',
    '4d',
    '4h',
    '4c',
  ].map(getCardFromSymbol);
  const idx = (seat - 1) * 2;
  return {
    hand: [cards[idx], cards[idx + 1]],
    money: 50,
    seat,
    userId: getId(seat),
  };
}

export function removePlayerHand(game: GameModel) {
  game.players.forEach((player: any) => {
    delete player.hand;
  });
  return game;
}

export function getPreflopGame(): GameModel {
  const bb = 0.5;
  return {
    _id: ObjectID.createFromTime(1),
    isPlaying: true,
    tableId: null!,
    pot: 0,
    currentBets: [bb],
    phases: [
      {
        type: 'pre-flop',
        moves: [],
        cards: [],
      },
    ],
    dealerPosition: 1,
    betMap: {
      [getId(2).toHexString()]: bb / 2,
      [getId(4).toHexString()]: bb,
    },
    stakes: bb * 100,
    players: [
      // dealer
      _getPlayer(1),
      // sb
      _getPlayer(2),
      // bb
      _getPlayer(4),
      // utg-1
      _getPlayer(6),
    ],
  };
}

class ChainMove {
  constructor(private game: GameModel) {}
  call() {
    processMove({ moveType: 'call' }, this.game);
    return this;
  }
  check() {
    processMove({ moveType: 'check' }, this.game);
    return this;
  }
  fold() {
    processMove({ moveType: 'fold' }, this.game);
    return this;
  }
  raise(amount: number) {
    processMove({ moveType: 'raise', raiseAmount: amount }, this.game);
    return this;
  }
}

export function chainMove(game: GameModel) {
  return new ChainMove(game);
}
