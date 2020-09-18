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
