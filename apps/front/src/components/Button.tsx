import * as React from 'react';
import { Theme } from 'src/Theme';
import styled from 'styled-components';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  htmlType?: 'button' | 'submit';
  disabled?: boolean;
  onClick?(): void;
}

const _Button = (props: ButtonProps) => {
  const { className, children, htmlType, ...rest } = props;
  return (
    <button type={htmlType} className={className} {...rest}>
      {children}
    </button>
  );
};

export const Button = styled(_Button)`
  display: block;
  padding: 10px 15px;
  background: ${Theme.blue};
  border: 4px;
`;
