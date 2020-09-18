import { createModule } from 'typeless';
import { LoginSymbol } from './symbol';

// --- Actions ---
export const [handle, LoginActions, getLoginState] = createModule(LoginSymbol)
  .withActions({
    $init: null,
    setLoading: (isLoading: boolean) => ({ payload: { isLoading } }),
    setError: (error: string) => ({ payload: { error } }),
  })
  .withState<LoginState>();

// --- Types ---
export interface LoginState {
  error: string;
  isLoading: boolean;
}
