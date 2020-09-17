import { handleAuth } from 'src/common/helper';
import { api } from 'src/services/api';
import { LoginActions, LoginState, handle } from './interface';
import { getLoginFormState, LoginFormActions } from './login-form';

// --- Epic ---
handle
  .epic()
  .on(LoginActions.$init, () => LoginFormActions.reset())
  .on(LoginFormActions.setSubmitSucceeded, () => {
    return handleAuth({
      Actions: LoginActions,
      auth: () => api.user_login(getLoginFormState().values),
    });
  });

// --- Reducer ---
const initialState: LoginState = {
  error: '',
  isLoading: false,
};

handle
  .reducer(initialState)
  .on(LoginActions.setLoading, (state, { isLoading }) => {
    state.isLoading = isLoading;
  })
  .on(LoginActions.setError, (state, { error }) => {
    state.error = error;
  });

// --- Module ---
export function useLoginModule() {
  handle();
}
