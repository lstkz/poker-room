import { GlobalState, handle } from './interface';

// --- Epic ---
handle.epic();

// --- Reducer ---
const initialState: GlobalState = {
  isLoaded: true,
  user: null,
};

handle.reducer(initialState);

// --- Module ---
export function useGlobalModule() {
  handle();
}
