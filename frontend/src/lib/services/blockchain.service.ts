import { config } from '../config/env';
import { AuthApiService, ApiErrorClass } from './auth.service';

// API configuration
const API_BASE_URL = config.api.baseUrl;

// Blockchain types
export interface BlockchainStats {
  totalTransactions: number;
  pendingTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageBlockTime: number;
  networkStatus: 'healthy' | 'congested' | 'degraded';
  lastBlockHeight: number;
  gasPrice: number;
  networkName: string;
  chainId: number;
  contractAddresses: {
    mediChainRegistry: string;
    accessControl: string;
  };
}

export interface BlockchainTransaction {
  id: string;
  hash: string;
  blockNumber: number;
  timestamp: string;
  type: 'record_hash' | 'access_grant' | 'revoke_access' | 'user_registration';
  status: 'confirmed' | 'pending' | 'failed';
  gasUsed: number;
  gasPrice: number;
  fromAddress: string;
  toAddress?: string;
  description: string;
  recordId?: string;
  userId?: string;
  errorMessage?: string;
}

export interface NetworkInfo {
  chainId: number;
  networkName: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ContractInfo {
  address: string;
  name: string;
  abi?: any[];
  deployedAt: string;
  version: string;
  verified: boolean;
}

// Generic API request handler with proper error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Add /api prefix to all endpoints since backend uses global prefix 'api'
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Get token from localStorage if available
  const token = AuthApiService.getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiErrorClass(
        data.message || `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiErrorClass(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      0
    );
  }
}

// Blockchain API service
export class BlockchainApiService {
  /**
   * Get blockchain network statistics
   */
  static async getBlockchainStats(): Promise<BlockchainStats> {
    try {
      return await apiRequest<BlockchainStats>('/blockchain/stats', {
        method: 'GET',
      });
    } catch (error) {
      // Return mock data if API is not available
      console.warn('Blockchain API not available, using mock data:', error);
      return {
        totalTransactions: 8765,
        pendingTransactions: 23,
        successfulTransactions: 8742,
        failedTransactions: 23,
        averageBlockTime: 2.1,
        networkStatus: 'healthy',
        lastBlockHeight: 45123678,
        gasPrice: 20,
        networkName: 'Polygon',
        chainId: 137,
        contractAddresses: {
          mediChainRegistry: '0x1234567890abcdef1234567890abcdef12345678',
          accessControl: '0xabcdef0123456789abcdef0123456789abcdef01'
        }
      };
    }
  }

  /**
   * Get recent blockchain transactions
   */
  static async getRecentTransactions(limit: number = 10): Promise<BlockchainTransaction[]> {
    try {
      return await apiRequest<BlockchainTransaction[]>(`/blockchain/transactions?limit=${limit}`, {
        method: 'GET',
      });
    } catch (error) {
      // Return mock data if API is not available
      console.warn('Blockchain transactions API not available, using mock data:', error);
      return [
        {
          id: '1',
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          blockNumber: 45123678,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          type: 'record_hash',
          status: 'confirmed',
          gasUsed: 21000,
          gasPrice: 20,
          fromAddress: '0x9876543210fedcba9876543210fedcba98765432',
          description: 'Patient record hash stored on blockchain'
        },
        {
          id: '2',
          hash: '0x5678901234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          blockNumber: 45123677,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          type: 'access_grant',
          status: 'confirmed',
          gasUsed: 45000,
          gasPrice: 22,
          fromAddress: '0x1111222233334444555566667777888899990000',
          description: 'Access granted to doctor for patient records'
        },
        {
          id: '3',
          hash: '0x9abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
          blockNumber: 0,
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          type: 'record_hash',
          status: 'pending',
          gasUsed: 0,
          gasPrice: 21,
          fromAddress: '0x3333444455556666777788889999aaaabbbbcccc',
          description: 'New medical record hash submission pending'
        }
      ];
    }
  }

  /**
   * Get transaction by hash
   */
  static async getTransaction(hash: string): Promise<BlockchainTransaction> {
    return apiRequest<BlockchainTransaction>(`/blockchain/transaction/${hash}`, {
      method: 'GET',
    });
  }

  /**
   * Get network information
   */
  static async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      return await apiRequest<NetworkInfo>('/blockchain/network', {
        method: 'GET',
      });
    } catch (error) {
      // Return mock data if API is not available
      console.warn('Network info API not available, using mock data:', error);
      return {
        chainId: 137,
        networkName: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorerUrl: 'https://polygonscan.com',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        }
      };
    }
  }

  /**
   * Get contract information
   */
  static async getContractInfo(): Promise<ContractInfo[]> {
    try {
      return await apiRequest<ContractInfo[]>('/blockchain/contracts', {
        method: 'GET',
      });
    } catch (error) {
      // Return mock data if API is not available
      console.warn('Contract info API not available, using mock data:', error);
      return [
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'MediChain Registry',
          deployedAt: '2024-01-15T10:30:00Z',
          version: '1.0.0',
          verified: true
        },
        {
          address: '0xabcdef0123456789abcdef0123456789abcdef01',
          name: 'Access Control',
          deployedAt: '2024-01-15T10:35:00Z',
          version: '1.0.0',
          verified: true
        }
      ];
    }
  }

  /**
   * Retry failed blockchain transaction
   */
  static async retryTransaction(transactionId: string): Promise<{ 
    success: boolean; 
    newHash?: string; 
    message: string 
  }> {
    return apiRequest<{ success: boolean; newHash?: string; message: string }>(
      `/blockchain/transaction/${transactionId}/retry`, 
      {
        method: 'POST',
      }
    );
  }

  /**
   * Get transaction statistics by type
   */
  static async getTransactionStats(): Promise<{
    [key: string]: {
      total: number;
      successful: number;
      failed: number;
      pending: number;
    }
  }> {
    try {
      return await apiRequest<{
        [key: string]: {
          total: number;
          successful: number;
          failed: number;
          pending: number;
        }
      }>('/blockchain/transaction-stats', {
        method: 'GET',
      });
    } catch (error) {
      // Return mock data if API is not available
      console.warn('Transaction stats API not available, using mock data:', error);
      return {
        record_hash: { total: 6234, successful: 6200, failed: 34, pending: 0 },
        access_grant: { total: 1567, successful: 1555, failed: 12, pending: 0 },
        revoke_access: { total: 432, successful: 430, failed: 2, pending: 0 },
        user_registration: { total: 532, successful: 525, failed: 7, pending: 0 }
      };
    }
  }

  /**
   * Get blockchain health status
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    lastBlockTime: number;
    syncStatus: 'synced' | 'syncing' | 'behind';
    issues: string[];
  }> {
    try {
      return await apiRequest<{
        status: 'healthy' | 'degraded' | 'down';
        responseTime: number;
        lastBlockTime: number;
        syncStatus: 'synced' | 'syncing' | 'behind';
        issues: string[];
      }>('/blockchain/health', {
        method: 'GET',
      });
    } catch (error) {
      // Return mock data if API is not available
      console.warn('Health status API not available, using mock data:', error);
      return {
        status: 'healthy',
        responseTime: 245,
        lastBlockTime: 2.1,
        syncStatus: 'synced',
        issues: []
      };
    }
  }

  /**
   * Format transaction hash for display
   */
  static formatHash(hash: string, startChars: number = 6, endChars: number = 4): string {
    if (hash.length <= startChars + endChars) {
      return hash;
    }
    return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
  }

  /**
   * Get blockchain explorer URL for transaction
   */
  static getExplorerUrl(hash: string, type: 'tx' | 'address' | 'block' = 'tx'): string {
    const baseUrl = 'https://polygonscan.com';
    switch (type) {
      case 'tx':
        return `${baseUrl}/tx/${hash}`;
      case 'address':
        return `${baseUrl}/address/${hash}`;
      case 'block':
        return `${baseUrl}/block/${hash}`;
      default:
        return `${baseUrl}/tx/${hash}`;
    }
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

// Export all types and the error class for use in components
export { ApiErrorClass };