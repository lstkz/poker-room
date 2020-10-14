import { Game, Table } from 'shared';
import * as Rx from 'src/rx';
import { api } from 'src/services/api';
import { initSocket } from 'src/services/socket';
import { clearAccessToken, getAccessToken } from 'src/services/Storage';
import { RouterActions } from 'typeless-router';
import {
  getGlobalState,
  GlobalActions,
  GlobalState,
  handle,
} from './interface';

// --- Epic ---
handle
  .epic()
  .onMany([GlobalActions.loaded, GlobalActions.loggedIn], () => {
    if (!getGlobalState().user) {
      return Rx.empty();
    }
    const socket = initSocket();
    return new Rx.Observable(subscriber => {
      socket.on('update', ({ game, table }: { game: Game; table: Table }) => {
        subscriber.next(GlobalActions.gameUpdated(game, table));
      });
    });
  })
  .on(GlobalActions.$mounted, () => {
    if (getAccessToken()) {
      return api.user_getMe().pipe(Rx.map(user => GlobalActions.loaded(user)));
    } else {
      return GlobalActions.loaded(null);
    }
  })
  .on(GlobalActions.logout, () => {
    clearAccessToken();
    return RouterActions.push('/login');
  });

// --- Reducer ---
const initialState: GlobalState = {
  isLoaded: false,
  user: null,
};

handle
  .reducer(initialState)
  .on(GlobalActions.loaded, (state, { user }) => {
    state.user = user;
    state.isLoaded = true;
  })
  .on(GlobalActions.loggedIn, (state, { user }) => {
    state.user = user;
  })
  .on(GlobalActions.logout, state => {
    state.user = null;
  });

// --- Module ---
export function useGlobalModule() {
  handle();
}
