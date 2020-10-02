import React from 'react';
import { Dashboard } from 'src/components/Dashboard';
import { RouteConfig } from 'src/types';
import { TableView } from './components/TableView';

// --- Routing ---

export const routeConfig: RouteConfig = {
  type: 'route',
  auth: true,
  path: '/tables/:id',
  component: (
    <Dashboard>
      <TableView />
    </Dashboard>
  ),
};
