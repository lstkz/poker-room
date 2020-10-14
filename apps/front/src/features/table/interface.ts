import { Game, Table } from 'shared';
import { createModule } from 'typeless';
import { TableSymbol } from './symbol';

// --- Actions ---
export const [handle, TableActions, getTableState] = createModule(TableSymbol)
  .withActions({
    $mounted: null,
    tableLoaded: (table: Table, game: Game) => ({ payload: { table, game } }),
    showJoinTable: (seat: number) => ({ payload: { seat } }),
    hideJoinTable: null,
    setJoinDisabled: (isDisabled: boolean) => ({ payload: { isDisabled } }),
  })
  .withState<TableState>();

// --- Types ---
export interface TableState {
  isLoaded: boolean;
  table: Table;
  game: Game;
  join: {
    isVisible: boolean;
    isDisabled: boolean;
    seat: number;
  };
}
