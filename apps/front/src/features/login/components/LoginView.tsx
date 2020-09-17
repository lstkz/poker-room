import React from 'react';
import { AuthPage } from 'src/components/AuthPage';
import { Button } from 'src/components/Button';
import { FormInput } from 'src/components/FormInput';
import { useActions, useMappedState } from 'typeless';
import { Link } from 'typeless-router';
import { getLoginState } from '../interface';
import {
  LoginFormActions,
  LoginFormProvider,
  useLoginForm,
} from '../login-form';
import { useLoginModule } from '../module';

export function LoginView() {
  useLoginForm();
  useLoginModule();
  const { error, isLoading } = useMappedState([getLoginState], state => state);
  const { submit } = useActions(LoginFormActions);
  return (
    <AuthPage title="Login" error={error}>
      <form
        onSubmit={e => {
          e.preventDefault();
          submit();
        }}
      >
        <LoginFormProvider>
          <FormInput name="username" label="Username" />
          <FormInput name="password" label="Password" htmlType="password" />
          <Button disabled={isLoading} htmlType="submit">
            Login
          </Button>
          <Link href="/register">Register</Link>
        </LoginFormProvider>
      </form>
    </AuthPage>
  );
}
