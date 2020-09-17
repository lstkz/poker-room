import { RouteConfig } from 'src/types';
import { createModule } from 'typeless';
import { HomeSymbol } from './symbol';


// --- Actions ---
export const [handle, HomeActions, getHomeState] = createModule(HomeSymbol)
  .withActions({})
  .withState<HomeState >();

// --- Routing ---
 
export const routeConfig: RouteConfig = {
  type: 'route',
  auth: true,
  path: '/home',
  component: () => import('./components/HomeView').then(x => x.HomeView)
};

// --- Types ---
export interface HomeState {
  foo: string;
}
