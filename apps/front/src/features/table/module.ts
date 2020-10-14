import * as Rx from 'src/rx';
import * as R from 'remeda';
import { api } from 'src/services/api';
import { getRouterState } from 'typeless-router';
import { TableActions, TableState, handle, getTableState } from './interface';
import { getJoinFormState, JoinFormActions } from './join-form';
import { getGlobalState, GlobalActions } from '../global/interface';
import { getSocket } from 'src/services/socket';

function getTableId() {
  return R.last(getRouterState().location!.pathname.split('/'))!;
}

// --- Epic ---
handle
  .epic()
  .on(TableActions.$mounted, () => {
    const socket = getSocket();
    socket.emit('join-table', { id: getTableId() });
    return Rx.empty();
  })
  .on(TableActions.$mounted, () => {
    const id = getTableId();
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
  )
  .on(JoinFormActions.setSubmitSucceeded, () => {
    return Rx.concatObs(
      Rx.of(TableActions.setJoinDisabled(true)),
      api
        .table_joinTable({
          tableId: getTableId(),
          seat: getTableState().join.seat,
          money: getJoinFormState().values.amount,
        })
        .pipe(Rx.map(() => TableActions.hideJoinTable())),
      Rx.of(TableActions.setJoinDisabled(false))
    );
  });

// --- Reducer ---
const initialState: TableState = {
  isLoaded: false,
  game: null!,
  table: null!,
  join: {
    isVisible: false,
    isDisabled: false,
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
      isDisabled: false,
      seat,
    };
  })
  .on(TableActions.setJoinDisabled, (state, { isDisabled }) => {
    state.join.isDisabled = isDisabled;
  })
  .on(TableActions.hideJoinTable, state => {
    state.join = initialState.join;
  })
  .on(GlobalActions.gameUpdated, (state, { game, table }) => {
    if (state.game.tableId === game.tableId) {
      state.game = game;
    }
    if (table && state.game.tableId === table.id) {
      state.table = table;
    }
  });

// --- Module ---
export function useTableModule() {
  handle();
}
