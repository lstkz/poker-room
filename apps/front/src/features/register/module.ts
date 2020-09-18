import { handleAuth } from 'src/common/helper';
import { api } from 'src/services/api';
import { RegisterActions, RegisterState, handle } from './interface';
import { getRegisterFormState, RegisterFormActions } from './register-form';

// --- Epic ---
handle
  .epic()
  .on(RegisterActions.$init, () => RegisterFormActions.reset())
  .on(RegisterFormActions.setSubmitSucceeded, () => {
    return handleAuth({
      Actions: RegisterActions,
      auth: () => api.user_register(getRegisterFormState().values),
    });
  });

// --- Reducer ---
const initialState: RegisterState = {
  error: '',
  isLoading: false,
};

handle
  .reducer(initialState)
  .on(RegisterActions.setLoading, (state, { isLoading }) => {
    state.isLoading = isLoading;
  })
  .on(RegisterActions.setError, (state, { error }) => {
    state.error = error;
  });

// --- Module ---
export function useRegisterModule() {
  handle();
}
