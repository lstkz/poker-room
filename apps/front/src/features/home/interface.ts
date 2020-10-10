import { Table } from 'src/types';
import { createModule } from 'typeless';
import { HomeSymbol } from './symbol';

// --- Actions ---
export const [handle, HomeActions, getHomeState] = createModule(HomeSymbol)
  .withActions({
    $mounted: null,
    tablesLoaded: (tables: Table[]) => ({ payload: { tables } }),
  })
  .withState<HomeState>();

// --- Types ---
export interface HomeState {
  isLoaded: boolean;
  tables: Table[];
}
