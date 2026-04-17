"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import SupernodeCpuModal from '@/components/common/SupernodeCpuModal';

interface ModalContextType {
  showSupernodeCpuModal: () => void;
  hideSupernodeCpuModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupernodeCpuModalOpen, setIsSupernodeCpuModalOpen] = useState(false);
  
  const showSupernodeCpuModal = () => setIsSupernodeCpuModalOpen(true);
  const hideSupernodeCpuModal = () => setIsSupernodeCpuModalOpen(false);
  
  return (
    <ModalContext.Provider value={{ showSupernodeCpuModal, hideSupernodeCpuModal }}>
      {children}
    </ModalContext.Provider>
  );
};
