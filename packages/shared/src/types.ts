export interface Foo {
  id: string;
  foo: string;
  bar: string;
}

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface AuthData {
  accessToken: string;
  user: User;
}

export interface TablePlayer {
  user: {
    id: string;
    username: string;
  };
  seat: number;
  money: number;
}

export interface Table {
  id: string;
  name: string;
  stakes: number;
  maxSeats: number;
  players: TablePlayer[];
}

export type MoveType = 'call' | 'check' | 'fold' | 'raise' | 'all-in';

export interface Card {
  card: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'T' | 'J' | 'Q' | 'K' | 'A';
  color: 'c' | 'd' | 'h' | 's';
}
