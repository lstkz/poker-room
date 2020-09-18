import { S, getValidateResult } from 'schema';
import { RegisterKeysSchema } from 'shared';

import { createForm } from 'typeless-form';
import { RegisterFormSymbol } from './symbol';

interface RegisterForm {
  username: string;
  password: string;
}

export const [
  useRegisterForm,
  RegisterFormActions,
  getRegisterFormState,
  RegisterFormProvider,
] = createForm<RegisterForm>({
  symbol: RegisterFormSymbol,
  validator(errors, data) {
    const ret = getValidateResult(data, S.object().keys(RegisterKeysSchema));
    ret.errors.forEach(item => {
      const name = item.path[0].toString() as keyof typeof errors;
      errors[name] = item.message;
    });
  },
});
