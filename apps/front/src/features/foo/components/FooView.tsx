import React from 'react';
import { useActions } from 'typeless';
import { FooActions } from '../interface';
import { useFooModule } from '../module';

export function FooView() {
  useFooModule();
  const { callAPI } = useActions(FooActions);

  return <button onClick={callAPI}>Feature foo</button>;
}
