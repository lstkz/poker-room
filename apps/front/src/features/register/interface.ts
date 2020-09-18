import { createModule } from 'typeless';
import { RegisterSymbol } from './symbol';

// --- Actions ---
export const [handle, RegisterActions, getRegisterState] = createModule(
  RegisterSymbol
)
  .withActions({
    $init: null,
    setLoading: (isLoading: boolean) => ({ payload: { isLoading } }),
    setError: (error: string) => ({ payload: { error } }),
  })
  .withState<RegisterState>();

// --- Types ---
export interface RegisterState {
  error: string;
  isLoading: boolean;
}
