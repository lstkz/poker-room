import React from 'react';
import { RouteConfig } from 'src/types';
import { LoginView } from './components/LoginView';

// --- Routing ---

export const routeConfig: RouteConfig = {
  type: 'route',
  auth: false,
  path: '/login',
  component: <LoginView />,
};
