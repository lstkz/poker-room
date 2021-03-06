import { Game, Table, User } from 'shared';
import { createModule } from 'typeless';
import { GlobalSymbol } from './symbol';

// --- Actions ---
export const [handle, GlobalActions, getGlobalState] = createModule(
  GlobalSymbol
)
  .withActions({
    $mounted: null,
    loaded: (user: User | null) => ({ payload: { user } }),
    loggedIn: (user: User) => ({ payload: { user } }),
    logout: null,
    gameUpdated: (game: Game, table?: Table) => ({ payload: { game, table } }),
  })
  .withState<GlobalState>();

// --- Types ---
export interface GlobalState {
  isLoaded: boolean;
  user: User | null;
}
