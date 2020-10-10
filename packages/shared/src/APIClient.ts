import * as Rx from 'rxjs';
import { ajax, AjaxRequest } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

import { MoveType } from './types';

// IMPORTS
import { Foo, Game, Table, User, AuthData } from './types';
// IMPORTS END

export class APIClient {
  constructor(
    private baseUrl: string,
    private getToken: () => string | null,
    private createXHR?: any
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // SIGNATURES
  example_createFoo(values: { foo: string }): Rx.Observable<Foo> {
    return this.call('example.createFoo', { values });
  }
  example_getAll(): Rx.Observable<Foo[]> {
    return this.call('example.getAll', {});
  }
  game_getCurrentGame(tableId: string): Rx.Observable<Game> {
    return this.call('game.getCurrentGame', { tableId });
  }
  game_makeMove(values: {
    gameId: string;
    moveType: MoveType;
    raiseAmount?: number | undefined;
  }): Rx.Observable<void> {
    return this.call('game.makeMove', { values });
  }
  table_createTable(values: {
    stakes: number;
    name: string;
    maxSeats: number;
  }): Rx.Observable<void> {
    return this.call('table.createTable', { values });
  }
  table_getAllTables(): Rx.Observable<Table[]> {
    return this.call('table.getAllTables', {});
  }
  table_getTableById(id: string): Rx.Observable<Table> {
    return this.call('table.getTableById', { id });
  }
  table_joinTable(values: {
    tableId: string;
    money: number;
    seat: number;
  }): Rx.Observable<Table> {
    return this.call('table.joinTable', { values });
  }
  table_leaveTable(values: { tableId: string }): Rx.Observable<Table> {
    return this.call('table.leaveTable', { values });
  }
  user_getMe(): Rx.Observable<User> {
    return this.call('user.getMe', {});
  }
  user_login(values: {
    username: string;
    password: string;
  }): Rx.Observable<AuthData> {
    return this.call('user.login', { values });
  }
  user_register(values: {
    username: string;
    password: string;
  }): Rx.Observable<AuthData> {
    return this.call('user.register', { values });
  }
  // SIGNATURES END
  private call(name: string, params: any): any {
    const token = this.getToken();
    const headers: any = {
      'content-type': 'application/json',
    };
    if (token) {
      headers['x-token'] = token;
    }
    const options: AjaxRequest = {
      url: `${this.baseUrl}/api/${name}`,
      method: 'POST',
      body: JSON.stringify(params),
      headers,
    };
    if (this.createXHR) {
      options.createXHR = this.createXHR;
    }
    return ajax(options).pipe(map(res => res.response));
  }
}
