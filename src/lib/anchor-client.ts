import { AnchorProvider, Program, BN, Wallet, utils } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Solearn } from '../../solearn/src/solearn';
import soLearnIdl from '../../solearn/src/solearn.json';
import { getCurrentProgramId } from './network-config';
import { UserAccount as FrontendUserAccount, ClientAccount as FrontendClientAccount, FrontendBountyAccount } from '@/types/program';

// Get program ID from network config
export const PROGRAM_ID = new PublicKey(getCurrentProgramId());

// Raw Solana program type definitions
export interface RawUserAccount {
  authority: PublicKey;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  joinedAt: BN;
  earned: BN;
  bountiesSubmitted: BN;
  bountiesCompleted: BN;
  bump: number;
}

export interface RawClientAccount {
  authority: PublicKey;
  companyName: string;
  companyEmail: string;
  companyAvatar: string;
  companyLink: string;
  companyBio: string;
  joinedAt: BN;
  rewarded: BN;
  bountiesPosted: BN;
  bump: number;
}

export interface BountyAccount {
  creatorWalletKey: PublicKey;
  clientKey: PublicKey;
  title: string;
  description: string;
  reward: BN;
  live: boolean;
  createdAt: BN;
  deadline: BN;
  requiredSkills: string[];
  noOfSubmissions: BN;
  selectedSubmission: PublicKey;
  selectedUserWalletKey: PublicKey;
  escrowAccount: PublicKey;
  bountyRewarded: boolean;
  bump: number;
}

export interface SubmissionAccount {
  userWalletKey: PublicKey;
  userKey: PublicKey;
  bountyKey: PublicKey;
  description: string;
  workUrl: string;
  bump: number;
}

// Conversion utilities
export const convertUserAccount = (rawUser: RawUserAccount): FrontendUserAccount => {
  return {
    authority: rawUser.authority.toString(),
    name: rawUser.name,
    email: rawUser.email,
    avatar: rawUser.avatar,
    bio: rawUser.bio,
    skills: rawUser.skills,
    joinedAt: new Date(rawUser.joinedAt.toNumber() * 1000),
    earned: rawUser.earned.toNumber() / LAMPORTS_PER_SOL,
    bountiesSubmitted: rawUser.bountiesSubmitted.toNumber(),
    bountiesCompleted: rawUser.bountiesCompleted.toNumber(),
  };
};

export const convertClientAccount = (rawClient: RawClientAccount): FrontendClientAccount => {
  return {
    authority: rawClient.authority.toString(),
    companyName: rawClient.companyName,
    companyEmail: rawClient.companyEmail,
    companyAvatar: rawClient.companyAvatar,
    companyLink: rawClient.companyLink,
    companyBio: rawClient.companyBio,
    joinedAt: new Date(rawClient.joinedAt.toNumber() * 1000),
    rewarded: rawClient.rewarded.toNumber() / LAMPORTS_PER_SOL,
    bountiesPosted: rawClient.bountiesPosted.toNumber(),
  };
};

export const convertBountyAccount = (rawBounty: BountyAccount): FrontendBountyAccount => {
  return {
    id: `${rawBounty.creatorWalletKey.toString()}-${rawBounty.title}`,
    creator: rawBounty.creatorWalletKey.toString(), // Add creator wallet for filtering
    client: rawBounty.clientKey.toString(),
    title: rawBounty.title,
    description: rawBounty.description,
    reward: rawBounty.reward.toNumber(), // Reward is stored in SOL units, not lamports
    deadline: new Date(rawBounty.deadline.toNumber() * 1000),
    skills: rawBounty.requiredSkills,
    status: rawBounty.live ? 'active' : 'completed',
    createdAt: new Date(rawBounty.createdAt.toNumber() * 1000),
    submissionCount: rawBounty.noOfSubmissions.toNumber(),
  };
};

export const convertSubmissionAccount = (rawSubmission: SubmissionAccount) => {
  return {
    id: `${rawSubmission.userWalletKey.toString()}-${rawSubmission.bountyKey.toString()}`,
    userWalletKey: rawSubmission.userWalletKey.toString(),
    userKey: rawSubmission.userKey.toString(),
    bountyKey: rawSubmission.bountyKey.toString(),
    description: rawSubmission.description,
    workUrl: rawSubmission.workUrl,
    bump: rawSubmission.bump,
  };
};

export class SolEarnAnchorClient {
  private program: Program<Solearn>;
  private provider: AnchorProvider;

  constructor(wallet: WalletContextState, connection: Connection) {
    // Create wallet adapter for Anchor with proper interface
    const anchorWallet = {
      publicKey: wallet.publicKey!,
      signTransaction: wallet.signTransaction!,
      signAllTransactions: wallet.signAllTransactions!,
    } as Wallet;
    
    this.provider = new AnchorProvider(connection, anchorWallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(soLearnIdl as Solearn, this.provider);
  }

  // PDA helper functions
  getUserPDA(authority: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [utils.bytes.utf8.encode('user'), authority.toBuffer()],
      PROGRAM_ID
    );
  }

  getClientPDA(authority: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [utils.bytes.utf8.encode('client'), authority.toBuffer()],
      PROGRAM_ID
    );
  }

  getBountyPDA(title: string, authority: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [utils.bytes.utf8.encode('bounty'), utils.bytes.utf8.encode(title), authority.toBuffer()],
      PROGRAM_ID
    );
  }

  getSubmissionPDA(userWallet: PublicKey, bountyPDA: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [utils.bytes.utf8.encode('submission'), userWallet.toBuffer(), bountyPDA.toBuffer()],
      PROGRAM_ID
    );
  }

  getEscrowPDA(bountyPDA: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [utils.bytes.utf8.encode('escrow'), bountyPDA.toBuffer()],
      PROGRAM_ID
    );
  }

  // User methods
  async createUser(name: string, email: string, skills: string[]): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [userPDA] = this.getUserPDA(authority);

    try {
      // Check if user already exists
      
      // First, check if account exists at the raw level
      try {
        const accountInfo = await this.provider.connection.getAccountInfo(userPDA);
        if (accountInfo) {
          const existingUser = await this.getUser(authority);
          if (existingUser) {
            throw new Error('User profile already exists for this wallet. Please use a different wallet or update your existing profile.');
          }
        }
      } catch {
        // Account doesn't exist, continue with creation
      }
      
      const existingUser = await this.getUser(authority);
      if (existingUser) {
  
        throw new Error('User profile already exists for this wallet. Please use a different wallet or update your existing profile.');
      }


      const tx = await this.program.methods
        .createUser(name, email, skills)
        .accountsStrict({
          authority,
          user: userPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();


      return tx;
    } catch (error: unknown) {
      console.error('CreateUser Error Details:');
      console.error('- Error:', error);
      console.error('- Error message:', error instanceof Error ? error.message : String(error));
      console.error('- Error logs:', (error as { logs?: string[] })?.logs);
      
      // Handle specific Solana errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorLogs = (error as { logs?: string[] })?.logs;
      if (errorMessage?.includes('already in use') || errorLogs?.some((log: string) => log.includes('already in use'))) {
        throw new Error('Account already exists for this wallet. Please try with a different wallet or contact support if this persists.');
      }
      
      throw error;
    }
  }

  async updateUser(name: string, email: string, bio: string, skills: string[]): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [userPDA] = this.getUserPDA(authority);

    const tx = await this.program.methods
      .updateUser(name, email, bio, skills)
      .accountsStrict({
        authority,
        user: userPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }



  async getUser(authority: PublicKey): Promise<FrontendUserAccount | null> {
    try {
      const [userPDA] = this.getUserPDA(authority);
      
      const account = await this.program.account.user.fetch(userPDA);
      const convertedAccount = convertUserAccount(account as RawUserAccount);
      return convertedAccount;
    } catch {
      return null;
    }
  }

  // Client methods
  async createClient(companyName: string, companyEmail: string, companyLink: string): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [clientPDA] = this.getClientPDA(authority);

    // Check if client already exists
    const existingClient = await this.getClient(authority);
    if (existingClient) {
      throw new Error('Client profile already exists for this wallet. Please use a different wallet or update your existing profile.');
    }

    const tx = await this.program.methods
      .createClient(companyName, companyEmail, companyLink)
      .accountsStrict({
        authority,
        client: clientPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async updateClient(companyName: string, companyEmail: string, companyLink: string, companyBio: string): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [clientPDA] = this.getClientPDA(authority);

    const tx = await this.program.methods
      .updateClient(companyName, companyEmail, companyLink, companyBio)
      .accountsStrict({
        authority,
        client: clientPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async getClient(authority: PublicKey): Promise<FrontendClientAccount | null> {
    try {
      const [clientPDA] = this.getClientPDA(authority);
      
      
      const account = await this.program.account.client.fetch(clientPDA);
      const convertedAccount = convertClientAccount(account as RawClientAccount);
      return convertedAccount;
        } catch {
      return null;
    }
  }

  // Bounty methods
  async createBounty(
    title: string,
    description: string,
    reward: number,
    deadline: number,
    skillsNeeded: string[]
  ): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [clientPDA] = this.getClientPDA(authority);
    const [bountyPDA] = this.getBountyPDA(title, authority);
    const [escrowPDA] = this.getEscrowPDA(bountyPDA);

    // The Solana program expects reward in SOL units, not lamports
    const rewardInSol = new BN(reward);

    const tx = await this.program.methods
      .createBounty(title, description, rewardInSol, new BN(deadline), skillsNeeded)
      .accountsStrict({
        authority,
        client: clientPDA,
        bounty: bountyPDA,
        escrowAccount: escrowPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async getBounty(title: string, authority: PublicKey): Promise<BountyAccount | null> {
    try {
      const [bountyPDA] = this.getBountyPDA(title, authority);
      const account = await this.program.account.bounty.fetch(bountyPDA);
      return account as BountyAccount;
    } catch {
      return null;
    }
  }

  async getAllBounties(): Promise<FrontendBountyAccount[]> {
    try {
      const accounts = await this.program.account.bounty.all();
      return accounts.map(account => convertBountyAccount(account.account as BountyAccount));
    } catch {
      return [];
    }
  }

  async updateBounty(
    originalTitle: string,
    newTitle: string,
    newDescription: string,
    newDeadline: number
  ): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [clientPDA] = this.getClientPDA(authority);
    const [bountyPDA] = this.getBountyPDA(originalTitle, authority);

    const tx = await this.program.methods
      .updateBounty(newTitle, newDescription, new BN(newDeadline))
      .accountsStrict({
        authority,
        client: clientPDA,
        bounty: bountyPDA,
      })
      .rpc();

    return tx;
  }

  async deleteBounty(title: string): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [clientPDA] = this.getClientPDA(authority);
    const [bountyPDA] = this.getBountyPDA(title, authority);
    const [escrowPDA] = this.getEscrowPDA(bountyPDA);

    const tx = await this.program.methods
      .deleteBounty(title)
      .accountsStrict({
        authority,
        client: clientPDA,
        bounty: bountyPDA,
        escrowAccount: escrowPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Submission methods
  async createSubmission(
    bountyTitle: string,
    bountyCreator: PublicKey,
    submissionDesc: string,
    submissionLink: string
  ): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [userPDA] = this.getUserPDA(authority);
    const [bountyPDA] = this.getBountyPDA(bountyTitle, bountyCreator);
    const [submissionPDA] = this.getSubmissionPDA(authority, bountyPDA);

    const tx = await this.program.methods
      .createSubmission(submissionDesc, submissionLink)
      .accountsStrict({
        authority,
        user: userPDA,
        bounty: bountyPDA,
        submission: submissionPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async getSubmissionsForBounty(bountyTitle: string, bountyCreator: PublicKey): Promise<SubmissionAccount[]> {
    try {
      const [bountyPDA] = this.getBountyPDA(bountyTitle, bountyCreator);
      const submissions = await this.program.account.submission.all([
        {
          memcmp: {
            offset: 8 + 32 + 32, // Skip discriminator + userWalletKey + userKey
            bytes: bountyPDA.toBase58(),
          },
        },
      ]);
      return submissions.map(submission => submission.account as SubmissionAccount);
          } catch {
        return [];
      }
  }

  async selectSubmission(
    bountyTitle: string,
    selectedUserWallet: PublicKey
  ): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [clientPDA] = this.getClientPDA(authority);
    const [bountyPDA] = this.getBountyPDA(bountyTitle, authority);
    const [submissionPDA] = this.getSubmissionPDA(selectedUserWallet, bountyPDA);
    const [selectedUserPDA] = this.getUserPDA(selectedUserWallet);
    const [escrowPDA] = this.getEscrowPDA(bountyPDA);

    const tx = await this.program.methods
      .selectSubmission()
      .accountsStrict({
        authority,
        client: clientPDA,
        bounty: bountyPDA,
        submission: submissionPDA,
        selectedUser: selectedUserPDA,
        escrowAccount: escrowPDA,
        selectedUserWallet: selectedUserWallet,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Profile deletion methods
  async deleteUser(): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [userPDA] = this.getUserPDA(authority);

    const tx = await this.program.methods
      .deleteUser()
      .accountsStrict({
        authority,
        user: userPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async deleteClient(): Promise<string> {
    const authority = this.provider.wallet.publicKey!;
    const [clientPDA] = this.getClientPDA(authority);

    const tx = await this.program.methods
      .deleteClient()
      .accountsStrict({
        authority,
        client: clientPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Helper method to wait for transaction confirmation
  async confirmTransaction(signature: string): Promise<void> {
    const latestBlockhash = await this.provider.connection.getLatestBlockhash();
    await this.provider.connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
  }
}
