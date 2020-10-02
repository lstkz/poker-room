import { createForm } from 'typeless-form';
import { getGlobalState } from '../global/interface';
import { getTableState } from './interface';
import { JoinFormSymbol } from './symbol';

interface JoinForm {
  amount: number;
}

export const [
  useJoinForm,
  JoinFormActions,
  getJoinFormState,
  JoinFormProvider,
] = createForm<JoinForm>({
  symbol: JoinFormSymbol,
  validator(errors, data) {
    const { stakes } = getTableState().table;
    const minAmount = 0.2 * stakes;
    const maxAmount = Math.min(stakes, getGlobalState().user!.bankroll);

    if (data.amount == null) {
      errors.amount = 'This field is required';
    } else if (data.amount < minAmount) {
      errors.amount = `Min: $${minAmount}`;
    } else if (data.amount > maxAmount) {
      errors.amount = `Max: $${maxAmount}`;
    }
  },
});
