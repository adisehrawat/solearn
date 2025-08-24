import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useWallet as useSolanaWallet, ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletError } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { ReactQueryProvider } from './react-query-provider';
import { ClusterProvider, useCluster } from '@/components/cluster/cluster-data-access';
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  disconnect: () => void;
  connect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletContextProvider({ children }: WalletProviderProps) {
  const { connected, publicKey, disconnect, connect } = useSolanaWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const value: WalletContextType = {
    connected,
    publicKey: publicKey?.toString() || null,
    disconnect: handleDisconnect,
    connect: handleConnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Solana Wallet Adapter Provider
function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const { cluster } = useCluster();
  
  // Configure wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );
  
  const onError = useCallback((error: WalletError) => {
    console.error('Wallet error:', error);
  }, []);

  // Use the cluster endpoint from context
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Keep the existing AppProviders for backward compatibility
// Note: SolanaProvider (our custom one) is now handled in app.tsx to avoid conflicts
export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ReactQueryProvider>
            <ClusterProvider>
                <SolanaWalletProvider>
                    <WalletContextProvider>
                        {children}
                    </WalletContextProvider>
                </SolanaWalletProvider>
            </ClusterProvider>
        </ReactQueryProvider>
    )
}