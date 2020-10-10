import { Game } from 'shared';

const currentUser = {
  bankroll: 1000,
  id: '5f7351de9dccc097c2cf7c51',
  isAdmin: false,
  username: 'user2',
};

export const games: Game[] = [
  // pre-flop
  {
    id: '1',
    isStarted: true,
    isDone: false,
    tableId: '2',
    phases: [],
    dealerPosition: 1,
    players: [
      {
        hand: null,
        money: 50,
        seat: 1,
        user: {
          id: 'userA',
          username: 'userA',
        },
      },
      {
        hand: [
          { card: 'A', color: 'c' },
          { card: 'A', color: 'd' },
        ],
        money: 50,
        seat: 2,
        user: {
          id: currentUser.id,
          username: currentUser.username,
        },
      },
      {
        hand: null,
        money: 50,
        seat: 4,
        user: {
          id: 'userB',
          username: 'userB',
        },
      },
      {
        hand: null,
        money: 50,
        seat: 5,
        user: {
          id: 'userC',
          username: 'userC',
        },
      },
    ],
    stakes: 50,
    pot: 0,
    betMap: {
      [currentUser.id]: 50 / 100 / 2,
      userB: 50 / 100,
    },
    currentBets: [],
    currentMovePlayerId: 'userC',
  },
  // flop
  {
    id: '1',
    isStarted: true,
    isDone: false,
    tableId: '2',
    phases: [
      {
        type: 'pre-flop',
        cards: [],
        moves: [
          {
            userId: 'userC',
            moveType: 'fold',
            amount: 0,
          },
          {
            userId: 'userA',
            moveType: 'call',
          },
          {
            userId: currentUser.id,
            moveType: 'call',
          },
          {
            userId: 'userA',
            moveType: 'check',
          },
        ],
      },
      {
        type: 'flop',
        cards: [
          { card: 'J', color: 'c' },
          { card: 'Q', color: 'c' },
          { card: 'K', color: 'c' },
        ],
        moves: [],
      },
    ],
    dealerPosition: 1,
    players: [
      {
        hand: null,
        money: 49.5,
        seat: 1,
        user: {
          id: 'userA',
          username: 'userA',
        },
      },
      {
        hand: [
          { card: 'A', color: 'c' },
          { card: 'A', color: 'd' },
        ],
        money: 49.5,
        seat: 2,
        user: {
          id: currentUser.id,
          username: currentUser.username,
        },
      },
      {
        hand: null,
        money: 49.5,
        seat: 4,
        user: {
          id: 'userB',
          username: 'userB',
        },
      },
      {
        hand: null,
        money: 50,
        seat: 5,
        user: {
          id: 'userC',
          username: 'userC',
        },
      },
    ],
    stakes: 50,
    pot: 1.5,
    betMap: {},
    currentBets: [],
    currentMovePlayerId: currentUser.id,
  },
];
