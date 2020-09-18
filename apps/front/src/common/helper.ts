import { AuthData } from 'shared';
import { GlobalActions } from 'src/features/global/interface';
import * as Rx from 'src/rx';
import { setAccessToken } from 'src/services/Storage';
import { RouterActions } from 'typeless-router';

interface HandleAuthOptions {
  Actions: {
    setLoading(isLoading: boolean): any;
    setError(error: string): any;
  };
  auth(): Rx.Observable<AuthData>;
}

export function handleAuth(options: HandleAuthOptions) {
  const { Actions, auth } = options;
  return Rx.concatObs(
    Rx.of(Actions.setLoading(true)),
    Rx.of(Actions.setError('')),
    auth().pipe(
      Rx.mergeMap(authData => {
        setAccessToken(authData.accessToken);
        return [GlobalActions.loggedIn(authData.user), RouterActions.push('/')];
      }),
      Rx.catchError(e => {
        const error = e.response?.error ?? e.message;
        return Rx.of(Actions.setError(error));
      })
    ),
    Rx.of(Actions.setLoading(false))
  );
}
