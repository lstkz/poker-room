import * as React from 'react';
import { Theme } from 'src/Theme';
import styled from 'styled-components';
import { FormContext } from 'typeless-form';

interface FormInputProps {
  className?: string;
  name: string;
  label: string;
  htmlType?: 'text' | 'password';
}

const Label = styled.label``;
const ErrorMessage = styled.div`
  color: ${Theme.red};
`;

const Input = styled.input`
  padding: 8px 12px;
`;

const _FormInput = (props: FormInputProps) => {
  const { className, htmlType, name, label, ...rest } = props;
  const {} = React.useContext(FormContext);
  const data = React.useContext(FormContext);
  if (!data) {
    throw new Error(`${name} cannot be used without FormContext`);
  }
  const hasError = data.touched[name] && !!data.errors[name];
  const value = data.values[name];
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        name={name}
        type={htmlType ?? 'text'}
        value={value == null ? '' : value}
        onBlur={() => data.actions.blur(name)}
        onChange={e => {
          data.actions.change(name, e.target.value);
        }}
        {...rest}
      />
      {hasError && <ErrorMessage>{data.errors[name]}</ErrorMessage>}
    </div>
  );
};

export const FormInput = styled(_FormInput)`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;
