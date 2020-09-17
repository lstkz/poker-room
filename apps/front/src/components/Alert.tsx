import * as React from 'react';
import { Theme } from 'src/Theme';
import styled from 'styled-components';

interface AlertProps {
  className?: string;
  children: React.ReactNode;
}

const _Alert = (props: AlertProps) => {
  const { className, children } = props;
  return <div className={className}>{children}</div>;
};

export const Alert = styled(_Alert)`
  display: block;
  text-align: center;
  padding: 8px 10px;
  background: ${Theme.red};
  color: white;
  border-radius: 4px;
  margin: 10px 0;
`;
