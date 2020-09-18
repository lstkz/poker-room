export interface Foo {
  id: string;
  foo: string;
  bar: string;
}

export interface User {
  id: string;
  username: string;
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
