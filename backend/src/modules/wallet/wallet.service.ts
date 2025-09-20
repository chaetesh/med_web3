import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class WalletService {
constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getUserWallet(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Mock wallet data
    return {
      address: user.walletAddress || null,
      balance: user.walletAddress ? this.getRandomBalance() : 0,
      transactions: user.walletAddress ? this.getMockTransactions() : []
    };
  }
  
  async connectWallet(userId: string, walletAddress: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    user.walletAddress = walletAddress;
    await user.save();
    
    return {
      success: true,
      message: 'Wallet connected successfully',
      address: walletAddress
    };
  }
  
  async disconnectWallet(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    user.walletAddress = '';
    await user.save();
    
    return {
      success: true,
      message: 'Wallet disconnected successfully'
    };
  }
  
  private getRandomBalance(): string {
    return (Math.random() * 10).toFixed(4) + ' ETH';
  }
  
  private getMockTransactions(): Array<{
    id: string;
    type: string;
    amount: string;
    from: string | null;
    to: string | null;
    timestamp: Date;
    status: string;
    gas: string;
  }> {
    const transactions: Array<{
      id: string;
      type: string;
      amount: string;
      from: string | null;
      to: string | null;
      timestamp: Date;
      status: string;
      gas: string;
    }> = [];
    
    // Generate random mock transactions
    for (let i = 0; i < 5; i++) {
      const isReceived = Math.random() > 0.5;
      
      transactions.push({
        id: `0x${this.generateRandomHex(64)}`,
        type: isReceived ? 'received' : 'sent',
        amount: (Math.random() * 2).toFixed(4) + ' ETH',
        from: isReceived ? `0x${this.generateRandomHex(40)}` : null,
        to: !isReceived ? `0x${this.generateRandomHex(40)}` : null,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        status: 'confirmed',
        gas: (0.001 * Math.random()).toFixed(6) + ' ETH'
      });
    }
    
    // Sort by timestamp, most recent first
    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  private generateRandomHex(length: number): string {
    const characters = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}
