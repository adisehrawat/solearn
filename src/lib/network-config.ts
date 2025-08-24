import { Connection, clusterApiUrl } from '@solana/web3.js';

export type NetworkType = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

export interface NetworkConfig {
  name: string;
  endpoint: string;
  displayName: string;
}

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  'mainnet-beta': {
    name: 'mainnet-beta',
    endpoint: clusterApiUrl('mainnet-beta'),
    displayName: 'Mainnet Beta',
  },
  devnet: {
    name: 'devnet',
    endpoint: clusterApiUrl('devnet'),
    displayName: 'Devnet',
  },
  testnet: {
    name: 'testnet',
    endpoint: clusterApiUrl('testnet'),
    displayName: 'Testnet',
  },
  localnet: {
    name: 'localnet',
    endpoint: 'http://127.0.0.1:8899',
    displayName: 'Localnet',
  },
};

// Environment-based network selection - DEVNET ONLY
export const getDefaultNetwork = (): NetworkType => {
  // Use import.meta.env for Vite instead of process.env
  const env = import.meta.env.MODE;
  const networkEnv = import.meta.env.VITE_SOLANA_NETWORK as NetworkType;
  
  // Force devnet for all environments except explicit localnet in development
  if (env === 'development' && networkEnv === 'localnet') {
    return 'localnet';
  }
  
  // Always default to devnet for production and staging
  return 'devnet';
};

export const getCurrentNetworkConfig = (): NetworkConfig => {
  const network = getDefaultNetwork();
  return NETWORK_CONFIGS[network];
};

export const createConnection = (network?: NetworkType): Connection => {
  const config = network ? NETWORK_CONFIGS[network] : getCurrentNetworkConfig();
  return new Connection(config.endpoint, 'confirmed');
};

// Program IDs for different networks - DEVNET FOCUSED
export const PROGRAM_IDS: Record<NetworkType, string> = {
  'mainnet-beta': '', // Disabled - not deploying to mainnet
  devnet: '3J4pJELCCwVFjD58iBUUa46pmrZNXwkWGwQkYm8pAc4j', // Main devnet program ID
  testnet: '', // Disabled - not deploying to testnet
  localnet: '3J4pJELCCwVFjD58iBUUa46pmrZNXwkWGwQkYm8pAc4j', // Local development only
};

export const getCurrentProgramId = (): string => {
  const network = getDefaultNetwork();
  const programId = PROGRAM_IDS[network];
  
  if (!programId) {
    throw new Error(`No program ID configured for network: ${network}`);
  }
  
  return programId;
};

// Network status checker
export const checkNetworkStatus = async (network: NetworkType): Promise<boolean> => {
  try {
    const connection = createConnection(network);
    const version = await connection.getVersion();
    return !!version;
  } catch (error) {
    console.error(`Failed to connect to ${network}:`, error);
    return false;
  }
};

// Airdrop helper for devnet only
export const requestAirdrop = async (
  publicKey: string,
  lamports: number = 1000000000, // 1 SOL
  network: NetworkType = 'devnet'
): Promise<string | null> => {
  if (network === 'mainnet-beta' || network === 'testnet') {
    throw new Error('Airdrop only available on devnet and localnet');
  }
  
  try {
    const connection = createConnection(network);
    const signature = await connection.requestAirdrop(
      new (await import('@solana/web3.js')).PublicKey(publicKey),
      lamports
    );
    
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Airdrop failed:', error);
    return null;
  }
};
