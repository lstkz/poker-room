import * as React from 'react';
import { Card } from 'shared';
import { CARD_HEIGHT, CARD_WIDTH, PlayCard } from 'src/components/PlayCard';
import styled from 'styled-components';

interface GameCardsProps {
  className?: string;
  cards: Card[];
}

const _GameCards = (props: GameCardsProps) => {
  const { className, cards } = props;
  return (
    <div className={className}>
      {cards.map((card, i) => (
        <PlayCard key={i} card={card} />
      ))}
    </div>
  );
};

export const GameCards = styled(_GameCards)`
  display: flex;
  position: absolute;
  top: calc(50% - ${CARD_HEIGHT / 2}px);
  left: calc(50% - 2.5 * ${CARD_WIDTH + 10}px);
  & > div {
    margin: 0 5px;
  }
`;
