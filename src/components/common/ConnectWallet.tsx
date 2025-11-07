'use client';

import { useWeb3 } from '@/providers/Web3Provider';

export const ConnectWallet = () => {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <button
      onClick={account ? disconnectWallet : connectWallet}
      disabled={isConnecting}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${account 
          ? 'bg-[#1A1B23] hover:bg-[#282A37] text-white' 
          : 'bg-[#04c74f] hover:bg-[#03b347] text-white'
        }
        ${isConnecting ? 'opacity-75 cursor-not-allowed' : ''}
      `}
    >
      {isConnecting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Connecting...
        </span>
      ) : account ? (
        formatAddress(account)
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};
