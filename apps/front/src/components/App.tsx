import React from 'react';
import * as R from 'remeda';
import { getGlobalState } from 'src/features/global/interface';
import { useGlobalModule } from 'src/features/global/module';
import { useRouterModule } from 'src/features/router';
import { useMappedState } from 'typeless';
import { RouteResolver } from './RouteResolver';

export function App() {
  useGlobalModule();
  useRouterModule();
  const { isLoaded } = useMappedState([getGlobalState], R.pick(['isLoaded']));
  if (!isLoaded) {
    return null;
  }

  return <RouteResolver />;
}
