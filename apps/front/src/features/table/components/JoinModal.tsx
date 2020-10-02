import React from 'react';
import { Button } from 'src/components/Button';
import { FormInput } from 'src/components/FormInput';
import { Modal } from 'src/components/Modal';
import { useActions } from 'typeless';
import { getTableState, TableActions } from '../interface';
import { JoinFormActions, JoinFormProvider } from '../join-form';

export function JoinModal() {
  const { join } = getTableState.useState();
  const { hideJoinTable } = useActions(TableActions);
  const { submit } = useActions(JoinFormActions);

  return (
    <Modal
      isVisible={join.isVisible}
      title="Join Table"
      onClose={hideJoinTable}
    >
      <form
        onSubmit={e => {
          e.preventDefault();
          submit();
        }}
      >
        <JoinFormProvider>
          <FormInput name="amount" label="amount" />

          <Button htmlType="submit">Join</Button>
        </JoinFormProvider>
      </form>
    </Modal>
  );
}
