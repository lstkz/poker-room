import React from 'react';
import { RouteConfig } from 'src/types';
import { FooView } from './components/FooView';

// --- Routing ---

export const routeConfig: RouteConfig = {
  type: 'route',
  auth: false,
  path: '/',
  component: <FooView />,
};
