import * as React from 'react';
import { Theme } from 'src/Theme';
import styled from 'styled-components';
import { Alert } from './Alert';

interface AuthPageProps {
  className?: string;
  title: string;
  error: string;
  children: React.ReactNode;
}

const Title = styled.h1`
  text-align: center;
`;

const _AuthPage = (props: AuthPageProps) => {
  const { className, title, error, children } = props;
  return (
    <div className={className}>
      <Title>{title}</Title>
      {error && <Alert>{error}</Alert>}
      {children}
    </div>
  );
};

export const AuthPage = styled(_AuthPage)`
  width: 400px;
  margin: 40px auto;
  padding: 15px;
  border: 1px solid ${Theme.border};
`;
