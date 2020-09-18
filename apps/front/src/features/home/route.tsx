import React from 'react';
import { RouteConfig } from 'src/types';
import { HomeView } from './components/HomeView';

// --- Routing ---

export const routeConfig: RouteConfig = {
  type: 'route',
  auth: true,
  path: '/',
  component: <HomeView />,
};
