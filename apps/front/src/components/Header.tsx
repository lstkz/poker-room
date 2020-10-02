import * as React from 'react';
import { GlobalActions } from 'src/features/global/interface';
import { useUser } from 'src/hooks/useUser';
import { Theme } from 'src/Theme';
import styled from 'styled-components';
import { useActions } from 'typeless';
import { Button } from './Button';
import { Container } from './Container';

interface HeaderProps {
  className?: string;
}

const Title = styled.h1`
  margin: 0;
`;
const Right = styled.div`
  display: flex;
  margin-right: 0;
  margin-left: auto;
  align-items: center;
`;

const Username = styled.span`
  margin-right: 10px;
`;

const _Header = (props: HeaderProps) => {
  const { className } = props;
  const user = useUser();
  const { logout } = useActions(GlobalActions);
  return (
    <div className={className}>
      <Container>
        <Title>Poker Room</Title>
        <Right>
          <Username>
            Hello, {user.username} (${user.bankroll})
          </Username>{' '}
          <Button onClick={logout}>logout</Button>
        </Right>
      </Container>
    </div>
  );
};

export const Header = styled(_Header)`
  display: block;
  padding: 15px 0;
  border: 1px solid ${Theme.border};
  ${Container} {
    display: flex;
  }
`;
