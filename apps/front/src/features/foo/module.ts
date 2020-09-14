import * as Rx from 'src/rx';
import { api } from 'src/services/api';
import { FooActions, FooState, handle } from './interface';

// --- Epic ---
handle.epic().on(FooActions.callAPI, () =>
  api
    .example_createFoo({
      foo: 'foo-' + Date.now(),
    })
    .pipe(
      Rx.tap(x => console.log('created', x)),
      Rx.ignoreElements()
    )
);

// --- Reducer ---
const initialState: FooState = {
  foo: 'bar',
};

handle.reducer(initialState);

// --- Module ---
export function useFooModule() {
  handle();
}
