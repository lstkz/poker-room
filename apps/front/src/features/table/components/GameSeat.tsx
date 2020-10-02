import * as React from 'react';
import { GamePlayerInfo } from 'shared';
import { Button } from 'src/components/Button';
import { Theme } from 'src/Theme';
import styled from 'styled-components';

interface GameSeatProps {
  className?: string;
  seat: number;
  player: GamePlayerInfo | null;
  join(): void;
}

const positions = [
  {
    left: 20,
    top: '50%',
  },
  {
    top: 20,
    left: '30%',
  },
  {
    top: 20,
    right: '30%',
  },
  {
    right: 20,
    top: '50%',
  },
  {
    bottom: 20,
    left: '30%',
  },
  {
    bottom: 20,
    right: '30%',
  },
];

const _GameSeat = (props: GameSeatProps) => {
  const { className, seat, join } = props;
  return (
    <div className={className} style={positions[seat - 1]}>
      <Button onClick={join}>Seat</Button>
    </div>
  );
};

export const GameSeat = styled(_GameSeat)`
  display: block;
  position: absolute;
  border: 1px solid ${Theme.border};
  padding: 10px 15px;
`;
