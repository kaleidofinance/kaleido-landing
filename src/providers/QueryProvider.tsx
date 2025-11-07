'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  // Create a client in each component to prevent data sharing between users 
  // and enable proper server-side rendering
  const [queryClient, setQueryClient] = useState<QueryClient | null>(null);
  
  // Deferred initialization for better browser compatibility, especially on Mac
  useEffect(() => {
    try {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            // Additional options to improve Mac Chrome compatibility
            retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
            networkMode: 'always',
          },
        },
      });
      
      setQueryClient(client);
    } catch (error) {
      console.error("Error initializing QueryClient:", error);
    }
  }, []);
  
  // Wait until queryClient is initialized before rendering children
  if (!queryClient) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Export the client for direct access in components that need it
export const getQueryClient = () => {
  try {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 5 * 60 * 1000,
          retry: 1,
          networkMode: 'always',
        },
      },
    });
    return queryClient;
  } catch (error) {
    console.error("Error creating QueryClient:", error);
    return null;
  }
}; 