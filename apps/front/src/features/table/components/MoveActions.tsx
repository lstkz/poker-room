import * as React from 'react';
// import Slider from 'react-slider';
import * as R from 'remeda';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { Game, GamePlayerInfo, getBB, getMinRaiseAmount } from 'shared';
import { Theme } from 'src/Theme';
import styled from 'styled-components';
import { useActions } from 'typeless';
import { TableActions } from '../interface';

interface MoveActionsProps {
  className?: string;
  game: Game;
  currentPlayer: GamePlayerInfo;
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

const RaiseWrapper = styled.div`
  display: flex;
  align-items: center;
  .rc-slider {
    margin-left: 10px;
    background: #ccc;
    width: 200px;
  }
`;

const _MoveActions = (props: MoveActionsProps) => {
  const { className, game, currentPlayer } = props;
  const currentBet = R.last(game.currentBets) ?? 0;
  const playerBet = game.betMap[currentPlayer.user.id] ?? 0;
  const callAmount = currentBet - playerBet;
  const { makeMove } = useActions(TableActions);
  const minRaise = React.useMemo(() => {
    return getMinRaiseAmount(game);
  }, [game]);
  const [raiseAmount, setRaiseAmount] = React.useState(minRaise);

  const renderCallCheckButton = () => {
    if (!callAmount) {
      return (
        <ActionButton onClick={() => makeMove('check')}>Check</ActionButton>
      );
    }
    if (callAmount > currentPlayer.money) {
      return (
        <ActionButton onClick={() => makeMove('all-in')}>
          All-in (${currentPlayer.money})
        </ActionButton>
      );
    }
    return (
      <ActionButton onClick={() => makeMove('call')}>
        Call (${callAmount})
      </ActionButton>
    );
  };

  const renderRaise = () => {
    return (
      <RaiseWrapper>
        <ActionButton onClick={() => makeMove('raise', raiseAmount)}>
          Raise (${raiseAmount})
        </ActionButton>
        <Slider
          min={minRaise}
          max={currentPlayer.money}
          value={raiseAmount}
          step={getBB(game)}
          dots
          onChange={val => {
            setRaiseAmount(val as number);
          }}
        />
      </RaiseWrapper>
    );
  };

  return (
    <div className={className}>
      <ButtonsWrapper>
        <ActionButton onClick={() => makeMove('fold')}>Fold</ActionButton>
        {renderCallCheckButton()}
        {renderRaise()}
      </ButtonsWrapper>
    </div>
  );
};

export const MoveActions = styled(_MoveActions)`
  display: block;
  margin-top: 20px;
`;
