import * as Rx from 'src/rx';
import { api } from 'src/services/api';
import { HomeActions, HomeState, handle } from './interface';

// --- Epic ---
handle
  .epic()
  .on(HomeActions.$mounted, () =>
    api.table_getAllTables().pipe(Rx.map(ret => HomeActions.tablesLoaded(ret)))
  );

// --- Reducer ---
const initialState: HomeState = {
  isLoaded: false,
  tables: [],
};

handle
  .reducer(initialState)
  .on(HomeActions.tablesLoaded, (state, { tables }) => {
    state.isLoaded = true;
    state.tables = tables;
  });

// --- Module ---
export function useHomeModule() {
  handle();
}
