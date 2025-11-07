"use client";

import { useState, useCallback } from 'react';
import { useWeb3 } from '@/providers/Web3Provider';
import toast from 'react-hot-toast';

interface UseXUsernameEditReturn {
  isModalOpen: boolean;
  currentUsername: string | undefined;
  openModal: () => void;
  closeModal: () => void;
  updateUsername: (newUsername: string) => void;
}

export const useXUsernameEdit = (initialUsername?: string): UseXUsernameEditReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | undefined>(initialUsername);
  const { account } = useWeb3();

  const openModal = useCallback(() => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    setIsModalOpen(true);
  }, [account]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const updateUsername = useCallback((newUsername: string) => {
    setCurrentUsername(newUsername);
    // You could also update any global state or context here if needed
  }, []);

  return {
    isModalOpen,
    currentUsername,
    openModal,
    closeModal,
    updateUsername
  };
};
