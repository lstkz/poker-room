import { createModule } from 'typeless';
import { FooSymbol } from './symbol';

// --- Actions ---
export const [handle, FooActions, getFooState] = createModule(FooSymbol)
  .withActions({
    callAPI: null,
  })
  .withState<FooState>();

// --- Types ---
export interface FooState {
  foo: string;
}
