import React from 'react';
import { RouteConfig } from 'src/types';
import { RegisterView } from './components/RegisterView';

// --- Routing ---

export const routeConfig: RouteConfig = {
  type: 'route',
  auth: false,
  path: '/register',
  component: <RegisterView />,
};
