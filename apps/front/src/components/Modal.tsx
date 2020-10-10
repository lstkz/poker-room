import * as React from 'react';
import { Theme } from 'src/Theme';
import styled from 'styled-components';

interface ModalProps {
  className?: string;
  isVisible: boolean;
  children: React.ReactNode;
  title: string;
  onClose(): void;
}

const Title = styled.h2`
  margin: 0;
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid ${Theme.border};
  position: relative;
`;

const Alpha = styled.div`
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
`;

const Dialog = styled.div`
  width: 500px;
  background: white;
  border-radius: 4px;
`;
const Content = styled.div`
  padding: 15px;
`;

const Close = styled.a`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 15px;
  right: 10px;
  height: 30px;
  width: 30px;
  line-height: 1;
  &&& {
    color: black;
    text-decoration: none;
  }
  cursor: pointer;
`;

const _Modal = (props: ModalProps) => {
  const { className, isVisible, children, title, onClose } = props;
  if (!isVisible) {
    return null;
  }
  return (
    <>
      <Alpha />
      <div className={className}>
        <Dialog>
          <Title>
            {title}{' '}
            <Close onClick={onClose} tabIndex={0}>
              x
            </Close>
          </Title>
          <Content>{children}</Content>
        </Dialog>
      </div>
    </>
  );
};

export const Modal = styled(_Modal)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 100;
`;
