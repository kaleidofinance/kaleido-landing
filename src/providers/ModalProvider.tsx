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
  
  // Show the modal on page load
  useEffect(() => {
    const shouldHide = localStorage.getItem('hideSupernodeCpuModal') === 'true';
    if (!shouldHide) {
    const timer = setTimeout(() => {
      setIsSupernodeCpuModalOpen(true);
    }, 1500); // 1.5 seconds delay
    return () => clearTimeout(timer);
    }
  }, []);
  
  const showSupernodeCpuModal = () => setIsSupernodeCpuModalOpen(true);
  const hideSupernodeCpuModal = () => setIsSupernodeCpuModalOpen(false);
  
  return (
    <ModalContext.Provider value={{ showSupernodeCpuModal, hideSupernodeCpuModal }}>
      {children}
      
      {/* Modals */}
      <SupernodeCpuModal 
        isOpen={isSupernodeCpuModalOpen} 
        onClose={hideSupernodeCpuModal} 
      />
    </ModalContext.Provider>
  );
};
