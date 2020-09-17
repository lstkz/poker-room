import React from 'react';
import { Button } from 'src/components/Button';
import { GlobalActions } from 'src/features/global/interface';
import { useUser } from 'src/hooks/useUser';
import { useActions } from 'typeless';
import { useHomeModule } from '../module';

export function HomeView() {
  useHomeModule();
  const user = useUser();
  const { logout } = useActions(GlobalActions);
  return (
    <div>
      Hello, {user.username} <Button onClick={logout}>logout</Button>
    </div>
  );
}
