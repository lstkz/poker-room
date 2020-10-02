import * as React from 'react';
import styled from 'styled-components';
import { Header } from './Header';

interface DashboardProps {
  className?: string;
  children: React.ReactNode;
}

const _Dashboard = (props: DashboardProps) => {
  const { className, children } = props;
  return (
    <div className={className}>
      <Header />
      {children}
    </div>
  );
};

export const Dashboard = styled(_Dashboard)`
  display: block;
`;
