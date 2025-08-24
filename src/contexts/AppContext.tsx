import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType, UserRole, ClientAccount, UserAccount } from '@/types/program';
import { useWallet } from '@solana/wallet-adapter-react';
import { SolEarnProgram } from '@/lib/program';
import { useSolana } from './SolanaProvider';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [clientAccount, setClientAccount] = useState<ClientAccount | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { publicKey, connected } = useWallet();
  const { programInitialized } = useSolana();

  // Load profile data when wallet connects and program is initialized
  useEffect(() => {
    const loadProfileData = async () => {
      if (!connected || !publicKey || !programInitialized) {
        setUserRole(null);
        setClientAccount(null);
        setUserAccount(null);
        return;
      }

      setIsLoading(true);
      try {
        // Try to fetch user account first
        const user = await SolEarnProgram.getUser(publicKey);
        if (user) {
          setUserAccount(user);
          setUserRole('user');
          setClientAccount(null);
  
          return;
        }

        // Try to fetch client account
        const client = await SolEarnProgram.getClient(publicKey);
        if (client) {
          setClientAccount(client);
          setUserRole('client');
          setUserAccount(null);
  
          return;
        }

        // No profile found
        setUserRole(null);
        setClientAccount(null);
        setUserAccount(null);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [connected, publicKey, programInitialized]);

  // Function to refresh profile data after updates
  const refreshProfile = async () => {
    if (!connected || !publicKey || !programInitialized) return;

    setIsLoading(true);
    try {
      if (userRole === 'user') {
        const user = await SolEarnProgram.getUser(publicKey);
        setUserAccount(user);
      } else if (userRole === 'client') {
        const client = await SolEarnProgram.getClient(publicKey);
        setClientAccount(client);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        clientAccount,
        userAccount,
        isLoading,
        refreshProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}