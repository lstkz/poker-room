import { GameCollection } from './collections/Game';
import { TableCollection } from './collections/Table';
import { createTable } from './contracts/table/createTable';
import { connect, disconnect } from './db';

const tables = [
  { name: 'Saturn', stakes: 50, maxSeats: 6 },
  { name: 'Mars', stakes: 50, maxSeats: 6 },
  { name: 'Alpha', stakes: 100, maxSeats: 6 },
  { name: 'Beta', stakes: 100, maxSeats: 6 },
];

async function start() {
  await connect();
  await GameCollection.deleteMany({});
  await TableCollection.deleteMany({});
  await Promise.all(tables.map(values => createTable(values)));
  await disconnect();
}

start();
