import React from 'react';
import { Button } from 'src/components/Button';
import { Container } from 'src/components/Container';
import { Theme } from 'src/Theme';
import styled from 'styled-components';
import { getHomeState } from '../interface';
import { useHomeModule } from '../module';

const Wrapper = styled.div`
  table {
    width: 400px;
    border-collapse: collapse;
    margin: 20px auto;
    td,
    th {
      border: 1px solid ${Theme.border};
      padding: 10px 15px;
    }
  }
`;

export function HomeView() {
  useHomeModule();
  const { isLoaded, tables } = getHomeState.useState();
  if (!isLoaded) {
    return <div>loading...</div>;
  }
  return (
    <Container>
      <Wrapper>
        <table>
          <thead>
            <th>Name</th>
            <th>Stakes</th>
            <th>Seats</th>
            <th />
          </thead>
          <tbody>
            {tables.map(table => (
              <tr key={table.id}>
                <td>{table.name}</td>
                <td>NL ${table.stakes}</td>
                <td>
                  {table.players.length} / {table.maxSeats}
                </td>
                <td>
                  <Button block href={`/tables/${table.id}`}>
                    Join
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Wrapper>
    </Container>
  );
}
