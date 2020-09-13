import { {{pascalCase name}}Actions, {{pascalCase name}}State, handle } from './interface';

// --- Epic ---
handle.epic();

// --- Reducer ---
const initialState: {{pascalCase name}}State = {
  foo: 'bar',
};

handle.reducer(initialState);

// --- Module ---
export function use{{pascalCase name}}Module() {
  handle();
};
