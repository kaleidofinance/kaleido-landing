"use client";

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/providers/Web3Provider';
import toast from 'react-hot-toast';

interface EditXUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername?: string;
  onSuccess?: (newUsername: string) => void;
}

const EditXUsernameModal: React.FC<EditXUsernameModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
  onSuccess
}) => {
  const { account } = useWeb3();
  const [xUsername, setXUsername] = useState(currentUsername || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset form when modal opens/closes
    if (isOpen) {
      // Make sure to update the username field with the current username
      setXUsername(currentUsername || '');
      setError('');
    }
  }, [isOpen, currentUsername]);
  
  // Make sure the username is updated if it changes externally
  useEffect(() => {
    if (currentUsername) {
      setXUsername(currentUsername);
    }
  }, [currentUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!xUsername.trim()) {
      setError('X username is required');
      return;
    }

    // Basic X username validation
    if (!xUsername.match(/^@?(\w){1,15}$/)) {
      setError('Please enter a valid X username (1-15 characters, letters, numbers, and underscores only)');
      return;
    }

    if (!account) {
      setError('Wallet connection required');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/testnet/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account,
          xUsername
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update X username');
      }

      toast.success('X username updated successfully');
      
      if (onSuccess) {
        onSuccess(data.xUsername);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating X username:', error);
      setError(error instanceof Error ? error.message : 'Failed to update X username');
      toast.error('Failed to update X username');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#22242F] rounded-xl p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          disabled={isSubmitting}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Edit X Username</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="xUsername" className="block text-sm font-medium text-gray-300 mb-1">
              X (Twitter) Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                @
              </span>
              <input
                id="xUsername"
                type="text"
                value={xUsername?.startsWith('@') ? xUsername.substring(1) : xUsername}
                onChange={(e) => setXUsername(e.target.value)}
                className="bg-[#131317] text-white w-full py-3 pl-8 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00dd72]"
                placeholder="username"
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#00dd72] rounded-lg hover:bg-[#00c868] focus:outline-none focus:ring-2 focus:ring-[#00dd72] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                'Update Username'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditXUsernameModal;
