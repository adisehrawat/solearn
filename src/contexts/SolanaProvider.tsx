import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { SolEarnProgram } from '@/lib/program';
import { getCurrentNetworkConfig, createConnection, NetworkType } from '@/lib/network-config';

interface SolanaContextType {
  connection: Connection;
  programInitialized: boolean;
  network: string;
  requestAirdrop: (lamports?: number) => Promise<string | null>;
}

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

interface SolanaProviderProps {
  children: ReactNode;
  network?: NetworkType;
}

export function SolanaProvider({ 
  children, 
  network
}: SolanaProviderProps) {
  const wallet = useWallet();
  const [connection] = useState(() => createConnection(network));
  const [programInitialized, setProgramInitialized] = useState(false);
  const [currentNetwork] = useState(() => getCurrentNetworkConfig());

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      try {
        SolEarnProgram.initialize(wallet, connection);
        setProgramInitialized(true);
  
      } catch (error) {
        console.error('Failed to initialize SolEarn program:', error);
        setProgramInitialized(false);
      }
    } else {
      setProgramInitialized(false);
    }
  }, [wallet, wallet.publicKey, connection]);

  const handleAirdrop = async (lamports: number = 1000000000): Promise<string | null> => {
    if (!wallet.publicKey || (currentNetwork.name !== 'devnet' && currentNetwork.name !== 'localnet')) {
      return null;
    }
    
    try {
      const signature = await connection.requestAirdrop(wallet.publicKey, lamports);
      await connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Airdrop failed:', error);
      return null;
    }
  };

  const value: SolanaContextType = {
    connection,
    programInitialized,
    network: currentNetwork.displayName,
    requestAirdrop: handleAirdrop,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
}

export function useSolana(): SolanaContextType {
  const context = useContext(SolanaContext);
  if (context === undefined) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
}
