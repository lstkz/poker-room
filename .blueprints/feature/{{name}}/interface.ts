import { RouteConfig } from 'src/types';
import { createModule } from 'typeless';
import { {{pascalCase name}}Symbol } from './symbol';


// --- Actions ---
export const [handle, {{pascalCase name}}Actions, get{{pascalCase name}}State] = createModule({{pascalCase name}}Symbol)
  .withActions({})
  .withState<{{pascalCase name}}State >();

// --- Routing ---
 
export const routeConfig: RouteConfig = {
  type: 'route',
  auth: true,
  path: '/{{dashCase name}}',
  component: () => import('./components/{{pascalCase name}}View').then(x => x.{{pascalCase name}}View)
};

// --- Types ---
export interface {{pascalCase name}}State {
  foo: string;
}
