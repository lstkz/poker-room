import React from 'react';
import { RouteConfig } from 'src/types';
import { {{pascalCase name}}View } from './components/{{pascalCase name}}View';

// --- Routing ---

export const routeConfig: RouteConfig = {
  type: 'route',
  auth: false,
  path: '/{{camelCase name}}',
  component: <{{pascalCase name}}View />,
};
