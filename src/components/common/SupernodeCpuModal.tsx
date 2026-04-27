'use client';

import React from 'react';

interface SupernodeCpuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SupernodeCpuModal — placeholder modal for the Supernode CPU feature.
 * Replace the contents with the real implementation when ready.
 */
const SupernodeCpuModal: React.FC<SupernodeCpuModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 transition hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="mb-2 text-xl font-bold text-white">Supernode CPU</h2>
        <p className="text-sm text-white/60">
          Supernode CPU mining is coming soon. Stay tuned for updates.
        </p>
      </div>
    </div>
  );
};

export default SupernodeCpuModal;
