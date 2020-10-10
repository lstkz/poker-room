import * as React from 'react';
import * as R from 'remeda';
import { GamePlayerInfo } from 'shared';
import { Button } from 'src/components/Button';
import styled from 'styled-components';

interface GameSeatProps {
  className?: string;
  seat: number;
  player: GamePlayerInfo | null;
  join(): void;
  isPlaying: boolean;
  isDealer: boolean;
  bet: number | undefined;
}

const positions = [
  {
    left: 20,
    top: '50%',
    cards: {
      top: 10,
      left: 50,
      transform: 'rotate(90deg)',
    },
    dealer: {
      left: 70,
      top: -40,
    },
    bet: {
      top: 10,
      left: 90,
    },
  },
  {
    top: 20,
    left: '30%',
    cards: {
      bottom: -40,
    },
    dealer: {
      bottom: -70,
      left: -40,
    },
    bet: {
      bottom: -80,
    },
  },
  {
    top: 20,
    right: '30%',
    cards: {
      bottom: -40,
    },
    dealer: {
      bottom: -70,
      left: -40,
    },
    bet: {
      bottom: -80,
    },
  },
  {
    right: 20,
    top: '50%',
    cards: {
      top: 10,
      right: 50,
      transform: 'rotate(90deg)',
    },
    dealer: {
      right: 70,
      top: -40,
    },
    bet: {
      top: 10,
      right: 90,
    },
  },
  {
    bottom: 20,
    right: '30%',
    cards: {
      top: -40,
    },
    dealer: {
      top: -70,
      right: -40,
    },
    bet: {
      top: -80,
    },
  },
  {
    bottom: 20,
    left: '30%',
    cards: {
      top: -40,
    },
    dealer: {
      top: -70,
      right: -40,
    },
    bet: {
      top: -80,
    },
  },
];

const PlayerInfo = styled.div`
  position: relative;
  color: white;
`;

const MoneyWrapper = styled.div`
  text-align: center;
`;

const PlayerCards = styled.div`
  display: flex;
  position: absolute;
`;

const BlankCard = styled.div`
  width: 12px;
  height: 20px;
  background: chocolate;
  border-radius: 1px;
  margin: 3px;
`;

const DealerWrapper = styled.div`
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ddd;
  color: #333;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const BetWrapper = styled.div`
  position: absolute;
`;

const _GameSeat = (props: GameSeatProps) => {
  const { className, seat, join, player, isPlaying, isDealer, bet } = props;
  const position = positions[seat - 1];
  const renderContent = () => {
    if (!player) {
      return <Button onClick={join}>Seat {seat}</Button>;
    }
    return (
      <PlayerInfo>
        {bet && <BetWrapper style={position.bet}>${bet}</BetWrapper>}
        {isDealer && <DealerWrapper style={position.dealer}>D</DealerWrapper>}
        {isPlaying && (
          <PlayerCards style={position.cards}>
            <BlankCard />
            <BlankCard />
          </PlayerCards>
        )}
        {player.user.username}
        <MoneyWrapper>${player.money - (bet ?? 0)}</MoneyWrapper>
      </PlayerInfo>
    );
  };
  return (
    <div className={className} style={R.omit(position, ['cards'])}>
      {renderContent()}
    </div>
  );
};

export const GameSeat = styled(_GameSeat)`
  display: block;
  position: absolute;
  border: 2px solid white;
  border-radius: 4px;
  padding: 10px 15px;
`;
