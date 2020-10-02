import * as Rx from 'src/rx';
import * as R from 'remeda';
import { api } from 'src/services/api';
import { getRouterState } from 'typeless-router';
import { TableActions, TableState, handle, getTableState } from './interface';
import { JoinFormActions } from './join-form';
import { getGlobalState } from '../global/interface';

// --- Epic ---
handle
  .epic()
  .on(TableActions.$mounted, () => {
    const id = R.last(getRouterState().location!.pathname.split('/'))!;
    return Rx.forkJoin([
      api.table_getTableById(id),
      api.game_getCurrentGame(id),
    ]).pipe(Rx.map(([table, game]) => TableActions.tableLoaded(table, game)));
  })
  .on(TableActions.showJoinTable, () =>
    JoinFormActions.change(
      'amount',
      Math.min(getTableState().table.stakes, getGlobalState().user!.bankroll)
    )
  );

// --- Reducer ---
const initialState: TableState = {
  isLoaded: false,
  game: null!,
  table: null!,
  join: {
    isVisible: false,
    seat: 0,
  },
};

handle
  .reducer(initialState)
  .on(TableActions.tableLoaded, (state, { game, table }) => {
    state.isLoaded = true;
    state.game = game;
    state.table = table;
  })
  .on(TableActions.showJoinTable, (state, { seat }) => {
    state.join = {
      isVisible: true,
      seat,
    };
  })
  .on(TableActions.hideJoinTable, state => {
    state.join = initialState.join;
  });

// --- Module ---
export function useTableModule() {
  handle();
}
