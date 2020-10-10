import * as React from 'react';
import { GamePlayerInfo } from 'shared';
import { PlayCard } from 'src/components/PlayCard';
import styled from 'styled-components';

interface MyCardsProps {
  className?: string;
  currentPlayer: GamePlayerInfo;
}

const CardsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  & > div {
    margin: 0 5px;
  }
`;

const _MyCards = (props: MyCardsProps) => {
  const { className, currentPlayer } = props;
  return (
    <div className={className}>
      <CardsWrapper>
        <PlayCard card={currentPlayer.hand![0]} />
        <PlayCard card={currentPlayer.hand![1]} />
      </CardsWrapper>
    </div>
  );
};

export const MyCards = styled(_MyCards)`
  display: block;
  margin-top: 10px;
`;
