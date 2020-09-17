import { HomeActions, HomeState, handle } from './interface';

// --- Epic ---
handle.epic();

// --- Reducer ---
const initialState: HomeState = {
  foo: 'bar',
};

handle.reducer(initialState);

// --- Module ---
export function useHomeModule() {
  handle();
};
