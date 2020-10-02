import * as React from 'react';
import { Card } from 'shared';
import styled from 'styled-components';
import { PlayCardInner } from './PlayCardInner';

interface PlayCardProps {
  card: Card;
}

const cardWidth = 68;
const cardHeight = 102;
const xMargin = 11.7;
const yMargin = 16;

const xCardMargin = 21;
const yCardMargin = 33;

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  width: ${cardWidth}px;
  height: ${cardHeight}px;
`;

export function PlayCard(props: PlayCardProps) {
  let cardOrder = [2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K', 'A'];
  let colorOrder = ['h', 'c', 'd', 's'];

  let cardIdx = cardOrder.indexOf(props.card.card);
  let colorIdx = colorOrder.indexOf(props.card.color);

  console.log({
    cardIdx,
    colorIdx,
    left: -(xCardMargin + cardIdx * (cardWidth + xMargin)),
    top: -(yCardMargin + (3 - colorIdx) * (cardHeight + yMargin)),
  });

  return (
    <Wrapper>
      <svg
        viewBox="0 0 1066.667 666.667"
        height={666.667}
        width={1066.667}
        style={{
          position: 'absolute',
          left: -(xCardMargin + cardIdx * (cardWidth + xMargin)),
          top: -(yCardMargin + (3 - colorIdx) * (cardHeight + yMargin)),
        }}
      >
        <PlayCardInner />
      </svg>
    </Wrapper>
  );
}
