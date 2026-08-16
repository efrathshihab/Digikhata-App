import React from 'react';
import { Modal, View } from 'react-native';

export const AppModal = ({ visible, children }: any) => (
  <Modal visible={visible}><View>{children}</View></Modal>
);