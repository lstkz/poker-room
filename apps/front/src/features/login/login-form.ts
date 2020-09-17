import { createForm } from 'typeless-form';
import { LoginFormSymbol } from './symbol';

interface LoginForm {
  username: string;
  password: string;
}

export const [
  useLoginForm,
  LoginFormActions,
  getLoginFormState,
  LoginFormProvider,
] = createForm<LoginForm>({
  symbol: LoginFormSymbol,
  validator(errors, data) {
    if (!data.username) {
      errors.username = 'This field is required';
    }
    if (!data.password) {
      errors.password = 'This field is required';
    }
  },
});
