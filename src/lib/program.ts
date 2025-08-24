import { PublicKey, Connection } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SolEarnAnchorClient, BountyAccount, SubmissionAccount } from './anchor-client';
import { UserAccount, ClientAccount, FrontendBountyAccount } from '@/types/program';
import { BN } from '@coral-xyz/anchor';

export const PROGRAM_ID = new PublicKey('3J4pJELCCwVFjD58iBUUa46pmrZNXwkWGwQkYm8pAc4j');

// Real Solana program interface
export class SolEarnProgram {
  private static client: SolEarnAnchorClient;

  static initialize(wallet: WalletContextState, connection: Connection) {
    this.client = new SolEarnAnchorClient(wallet, connection);
  }

  static async createClient(companyName: string, companyEmail: string, companyLink: string, companyBio?: string) {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const tx = await this.client.createClient(companyName, companyEmail, companyLink);
      await this.client.confirmTransaction(tx);
      
      // If bio is provided, update the client with bio
      if (companyBio) {
        const updateTx = await this.client.updateClient(companyName, companyEmail, companyLink, companyBio);
        await this.client.confirmTransaction(updateTx);
      }
      
      return {
        success: true,
        transaction: tx,
        message: 'Client created successfully'
      };
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  static async createUser(name: string, email: string, skills: string[], bio?: string) {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const tx = await this.client.createUser(name, email, skills);
      await this.client.confirmTransaction(tx);
      
      // If bio is provided, update the user with bio
      if (bio) {
        const updateTx = await this.client.updateUser(name, email, bio, skills);
        await this.client.confirmTransaction(updateTx);
      }
      
      return {
        success: true,
        transaction: tx,
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(name: string, email: string, bio: string, skills: string[]): Promise<{ success: boolean; transaction: string; message: string }> {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const tx = await this.client.updateUser(name, email, bio, skills);
      await this.client.confirmTransaction(tx);
      
      return {
        success: true,
        transaction: tx,
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async createBounty(
    title: string,
    description: string,
    reward: number,
    deadline: Date,
    skills: string[]
  ) {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);
      const tx = await this.client.createBounty(title, description, reward, deadlineTimestamp, skills);
      await this.client.confirmTransaction(tx);
      
      return {
        success: true,
        transaction: tx,
        message: 'Bounty created successfully'
      };
    } catch (error) {
      console.error('Error creating bounty:', error);
      throw error;
    }
  }

  static async createSubmission(
    bountyTitle: string,
    bountyCreator: PublicKey,
    workUrl: string,
    description: string
  ) {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const tx = await this.client.createSubmission(bountyTitle, bountyCreator, description, workUrl);
      await this.client.confirmTransaction(tx);
      
      return {
        success: true,
        transaction: tx,
        message: 'Submission created successfully'
      };
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  static async selectSubmission(bountyTitle: string, selectedUserWallet: PublicKey) {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const tx = await this.client.selectSubmission(bountyTitle, selectedUserWallet);
      await this.client.confirmTransaction(tx);
      
      return {
        success: true,
        transaction: tx,
        message: 'Submission selected and payment processed'
      };
    } catch (error) {
      console.error('Error selecting submission:', error);
      throw error;
    }
  }

  // Data fetching methods
  static async getUser(authority: PublicKey): Promise<UserAccount | null> {
    if (!this.client) throw new Error('Program not initialized');
    return await this.client.getUser(authority);
  }



  static async getClient(authority: PublicKey): Promise<ClientAccount | null> {
    if (!this.client) throw new Error('Program not initialized');
    return await this.client.getClient(authority);
  }

  static async getBounty(title: string, authority: PublicKey): Promise<BountyAccount | null> {
    if (!this.client) throw new Error('Program not initialized');
    return await this.client.getBounty(title, authority);
  }

  static async getAllBounties(): Promise<FrontendBountyAccount[]> {
    if (!this.client) throw new Error('Program not initialized');
    return await this.client.getAllBounties();
  }

  static async getSubmissionsForBounty(bountyTitle: string, bountyCreator: PublicKey): Promise<SubmissionAccount[]> {
    if (!this.client) throw new Error('Program not initialized');
    return await this.client.getSubmissionsForBounty(bountyTitle, bountyCreator);
  }

  static async updateBounty(
    originalTitle: string,
    newTitle: string,
    newDescription: string,
    newDeadline: Date
  ) {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const deadlineTimestamp = Math.floor(newDeadline.getTime() / 1000);
      const tx = await this.client.updateBounty(originalTitle, newTitle, newDescription, deadlineTimestamp);
      await this.client.confirmTransaction(tx);
      
      return {
        success: true,
        transaction: tx,
        message: 'Bounty updated successfully'
      };
    } catch (error) {
      console.error('Error updating bounty:', error);
      throw error;
    }
  }

  static async deleteBounty(title: string) {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const tx = await this.client.deleteBounty(title);
      await this.client.confirmTransaction(tx);
      
      return {
        success: true,
        transaction: tx,
        message: 'Bounty deleted and funds refunded'
      };
    } catch (error) {
      console.error('Error deleting bounty:', error);
      throw error;
    }
  }

  static async deleteUser() {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const tx = await this.client.deleteUser();
      await this.client.confirmTransaction(tx);
      
      return {
        success: true,
        transaction: tx,
        message: 'User profile deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async deleteClient() {
    if (!this.client) throw new Error('Program not initialized');
    
    try {
      const tx = await this.client.deleteClient();
      await this.client.confirmTransaction(tx);
      
      return {
        success: true,
        transaction: tx,
        message: 'Client profile deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // Helper methods for UI
  static formatSolAmount(lamports: BN | number): number {
    if (typeof lamports === 'number') {
      return lamports; // Already converted to SOL
    }
    return lamports.toNumber() / 1000000000; // Convert lamports to SOL
  }

  static formatTimestamp(timestamp: BN | Date): Date {
    if (timestamp instanceof Date) {
      return timestamp; // Already converted to Date
    }
    return new Date(timestamp.toNumber() * 1000);
  }
}