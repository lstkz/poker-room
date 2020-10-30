import React from 'react';
import * as R from 'remeda';
import { Container } from 'src/components/Container';
import { useUser } from 'src/hooks/useUser';
// import { games } from 'src/mock-data/game';
import styled from 'styled-components';
import { useActions } from 'typeless';
import { getTableState, TableActions } from '../interface';
import { useJoinForm } from '../join-form';
import { useTableModule } from '../module';
import { useGameState } from '../useGameState';
import { GameCards } from './GameCards';
import { GameSeat } from './GameSeat';
import { JoinModal } from './JoinModal';
import { MoveActions } from './MoveActions';
import { MyCards } from './MyCards';

const Wrapper = styled.div`
  margin-top: 10px;
`;
const Header = styled.div``;

const TableBg = styled.div`
  width: 1000px;
  height: 600px;
  background: #005500;
  border-radius: 10%;
  margin: 0 auto;
  position: relative;
  margin-top: 20px;
`;

const PotWrapper = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 160px;
  color: white;
  font-size: 16px;
`;

const PlayerActionWrapper = styled.div`
  background: #eaeaea;
  padding: 15px;
`;

export function TableView() {
  useTableModule();
  useJoinForm();
  const user = useUser();
  const { isLoaded, table, game } = getTableState.useState();
  // const game = games[1];
  const { showJoinTable, leaveTable } = useActions(TableActions);
  const {
    gameSeatMap,
    tableSeatMap,
    foldedMap,
    cards,
    currentPlayer,
  } = useGameState(user, table, game);

  const isSeating = React.useMemo(() => {
    if (!table) {
      return false;
    }
    return table.players.some(x => x.user.id === user.id);
  }, [table, user]);

  if (!isLoaded) {
    return <div>loading...</div>;
  }

  return (
    <Container>
      <JoinModal />
      <Wrapper>
        <Header>
          {table.name} - NL ${table.stakes} <br />
          players: {table.players.length} / {table.maxSeats}
          <br />
          game id: {game.id}
        </Header>
      </Wrapper>
      {isSeating && (
        <div>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              leaveTable();
            }}
          >
            Leave table
          </a>
        </div>
      )}
      <TableBg>
        <PotWrapper>Pot: ${game.pot}</PotWrapper>
        <GameCards cards={cards} />
        {R.range(1, table.maxSeats + 1).map(seat => {
          const gamePlayer = gameSeatMap[seat];
          const tablePlayer = tableSeatMap[seat];

          return (
            <GameSeat
              bet={gamePlayer && game.betMap[gamePlayer.user.id]}
              isDealer={seat === game.dealerPosition}
              isPlaying={gamePlayer && !foldedMap[gamePlayer.user.id]}
              isCurrentPlayer={tablePlayer && user.id === tablePlayer.user.id}
              player={tablePlayer}
              seat={seat}
              key={seat}
              join={() => showJoinTable(seat)}
              moves={R.last(game.phases)?.moves ?? []}
              currentMovePlayerId={game.currentMovePlayerId}
            />
          );
        })}
      </TableBg>
      {currentPlayer && !foldedMap[currentPlayer.user.id] && (
        <PlayerActionWrapper>
          <MyCards currentPlayer={currentPlayer} />
          {game.currentMovePlayerId === currentPlayer.user.id && (
            <MoveActions currentPlayer={currentPlayer} game={game} />
          )}
        </PlayerActionWrapper>
      )}
    </Container>
  );
}
