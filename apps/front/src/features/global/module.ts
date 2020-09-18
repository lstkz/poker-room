import * as Rx from 'src/rx';
import { api } from 'src/services/api';
import { clearAccessToken, getAccessToken } from 'src/services/Storage';
import { RouterActions } from 'typeless-router';
import { GlobalActions, GlobalState, handle } from './interface';

// --- Epic ---
handle
  .epic()
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
