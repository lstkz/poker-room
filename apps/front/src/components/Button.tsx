import * as React from 'react';
import { Theme } from 'src/Theme';
import styled, { css } from 'styled-components';
import { Link } from 'typeless-router';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  htmlType?: 'button' | 'submit';
  disabled?: boolean;
  onClick?(): void;
  block?: boolean;
  href?: string;
}

const _Button = (props: ButtonProps) => {
  const { className, children, htmlType, href, ...rest } = props;
  if (href) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
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
  color: #333;
  text-align: center;
  ${props =>
    props.block &&
    css`
      width: 100%;
    `}
  &:hover {
    cursor: pointer;
    opacity: 0.85;
    text-decoration: none;
  }
`;
