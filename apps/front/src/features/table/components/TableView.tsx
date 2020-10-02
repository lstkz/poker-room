import React from 'react';
import * as R from 'remeda';
import { Container } from 'src/components/Container';
import { PlayCard } from 'src/components/PlayCard';
import styled from 'styled-components';
import { useActions } from 'typeless';
import { getTableState, TableActions } from '../interface';
import { useJoinForm } from '../join-form';
import { useTableModule } from '../module';
import { GameSeat } from './GameSeat';
import { JoinModal } from './JoinModal';

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

export function TableView() {
  useTableModule();
  useJoinForm();
  const { isLoaded, table, game } = getTableState.useState();
  const { showJoinTable } = useActions(TableActions);
  if (!isLoaded) {
    return <div>loading...</div>;
  }

  return (
    <Container>
      <PlayCard card={{ card: 'T', color: 'h' }} />
      {/* <PlayCard card={{ card: 3, color: 'h' }} />
      <PlayCard card={{ card: 5, color: 's' }} /> */}
      <JoinModal />
      <Wrapper>
        <Header>
          {table.name} - NL ${table.stakes} <br />
          players: {table.players.length} / {table.maxSeats}
          <br />
          game id: {game.id}
        </Header>
      </Wrapper>
      <TableBg>
        {R.range(1, table.maxSeats + 1).map(seat => (
          <GameSeat
            player={null}
            seat={seat}
            key={seat}
            join={() => showJoinTable(seat)}
          />
        ))}
      </TableBg>
    </Container>
  );
}
