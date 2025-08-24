export interface BountyAccount {
  id: string;
  creator: string; // Wallet that created the bounty
  client: string; // Client account key
  title: string;
  description: string;
  reward: number;
  deadline: Date;
  skills: string[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  submissionCount: number;
}

// Frontend-friendly bounty interface (converted from Solana program data)
export interface FrontendBountyAccount {
  id: string;
  creator: string; // Wallet that created the bounty
  client: string; // Client account key
  title: string;
  description: string;
  reward: number;
  deadline: Date;
  skills: string[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  submissionCount: number;
}

export interface SubmissionAccount {
  id: string;
  bounty: string;
  user: string;
  workUrl: string;
  description: string;
  submittedAt: Date;
  isWinner: boolean;
}

// Frontend-friendly submission interface (converted from Solana program data)
export interface FrontendSubmissionAccount {
  id: string;
  userWalletKey: string; // PublicKey as string
  userKey: string; // PublicKey as string
  bountyKey: string; // PublicKey as string
  description: string;
  workUrl: string;
  bump: number;
}

// Frontend-friendly interfaces (converted from Solana program data)
export interface ClientAccount {
  authority: string; // PublicKey as string
  companyName: string;
  companyEmail: string;
  companyAvatar: string;
  companyLink: string;
  companyBio: string;
  joinedAt: Date; // Converted from BN
  rewarded: number; // Converted from BN (lamports to SOL)
  bountiesPosted: number; // Converted from BN
}

export interface UserAccount {
  authority: string; // PublicKey as string
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  joinedAt: Date; // Converted from BN
  earned: number; // Converted from BN (lamports to SOL)
  bountiesSubmitted: number; // Converted from BN
  bountiesCompleted: number; // Converted from BN
}

export type UserRole = 'client' | 'user' | null;

export interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  clientAccount: ClientAccount | null;
  userAccount: UserAccount | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

export interface BountyFormData {
  title: string;
  description: string;
  reward: number;
  deadline: Date;
  skills: string[];
}