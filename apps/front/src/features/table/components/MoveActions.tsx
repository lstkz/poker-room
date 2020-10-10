import * as React from 'react';
import { Game } from 'shared';
import { Theme } from 'src/Theme';
import styled from 'styled-components';

interface MoveActionsProps {
  className?: string;
  game: Game;
}

const ActionButton = styled.button`
  font-size: 20px;
  border-radius: 5px;
  padding: 20px 40px;
  color: black;
  background: ${Theme.blue};
  margin: 0 5px;
  cursor: pointer;
  border: none;
  &:hover {
    background: blue;
    color: white;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const _MoveActions = (props: MoveActionsProps) => {
  const { className, game } = props;
  return (
    <div className={className}>
      <ButtonsWrapper>
        <ActionButton>Fold</ActionButton>
        <ActionButton>Check</ActionButton>
        <ActionButton>Raise</ActionButton>
      </ButtonsWrapper>
    </div>
  );
};

export const MoveActions = styled(_MoveActions)`
  display: block;
  margin-top: 20px;
`;
