import { getGlobalState } from 'src/features/global/interface';
import { useMappedState } from 'typeless';
import { usePrevious } from './usePrevious';

export function useUser() {
  const user = useMappedState([getGlobalState], state => state.user);
  const prevUser = usePrevious(user);
  return user ?? prevUser!;
}
