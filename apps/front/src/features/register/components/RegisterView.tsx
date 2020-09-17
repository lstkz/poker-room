import React from 'react';
import { AuthPage } from 'src/components/AuthPage';
import { Button } from 'src/components/Button';
import { FormInput } from 'src/components/FormInput';
import { useActions, useMappedState } from 'typeless';
import { Link } from 'typeless-router';
import { getRegisterState } from '../interface';
import { useRegisterModule } from '../module';
import {
  RegisterFormActions,
  RegisterFormProvider,
  useRegisterForm,
} from '../register-form';

export function RegisterView() {
  useRegisterForm();
  useRegisterModule();

  const { error, isLoading } = useMappedState(
    [getRegisterState],
    state => state
  );
  const { submit } = useActions(RegisterFormActions);
  return (
    <AuthPage title="Register" error={error}>
      <form
        onSubmit={e => {
          e.preventDefault();
          submit();
        }}
      >
        <RegisterFormProvider>
          <FormInput name="username" label="Username" />
          <FormInput name="password" label="Password" htmlType="password" />
          <Button disabled={isLoading} htmlType="submit">
            Register
          </Button>
          <Link href="/login">Login</Link>
        </RegisterFormProvider>
      </form>
    </AuthPage>
  );
}
