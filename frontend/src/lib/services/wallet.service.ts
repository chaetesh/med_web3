import { config } from '../config/env';

interface WalletData {
  address: string | null;
  balance: string;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  from: string | null;
  to: string | null;
  timestamp: string;
  status: string;
  gas: string;
}

interface ConnectWalletResponse {
  success: boolean;
  message: string;
  address: string;
}

interface DisconnectWalletResponse {
  success: boolean;
  message: string;
}

// API configuration
const API_BASE_URL = config.api.baseUrl;
const TOKEN_KEY = config.auth.tokenKey;

// Custom error class for API errors
class ApiErrorClass extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
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
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
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

export class WalletApiService {
  /**
   * Get user's wallet data
   */
  static async getUserWallet(): Promise<WalletData> {
    return apiRequest<WalletData>('/wallet', {
      method: 'GET',
    });
  }

  /**
   * Connect wallet to user account
   */
  static async connectWallet(walletAddress: string): Promise<ConnectWalletResponse> {
    // Validate wallet address format on frontend
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      throw new ApiErrorClass('Invalid wallet address format', 400);
    }

    return apiRequest<ConnectWalletResponse>('/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  /**
   * Link wallet to user account (alias for connectWallet for backward compatibility)
   */
  static async linkWallet(walletAddress: string): Promise<ConnectWalletResponse> {
    return this.connectWallet(walletAddress);
  }

  /**
   * Get wallet connection status
   */
  static async getWalletStatus(): Promise<{ isConnected: boolean; address: string | null }> {
    return apiRequest<{ isConnected: boolean; address: string | null }>('/wallet/status', {
      method: 'GET',
    });
  }

  /**
   * Disconnect wallet from user account
   */
  static async disconnectWallet(): Promise<DisconnectWalletResponse> {
    return apiRequest<DisconnectWalletResponse>('/wallet/disconnect', {
      method: 'DELETE',
    });
  }

  /**
   * Get wallet balance (this could be extended to get real-time balance from blockchain)
   */
  static async getWalletBalance(address: string): Promise<{ balance: string; currency: string }> {
    try {
      // For now, return a simple response
      // In a real implementation, you might call a blockchain API or your backend
      return {
        balance: '0.0000',
        currency: 'ETH'
      };
    } catch (error) {
      throw new Error('Failed to get wallet balance');
    }
  }

  /**
   * Record a transaction when it actually happens
   */
  static async addTransaction(transactionData: {
    transactionHash: string;
    type: 'sent' | 'received' | 'reward' | 'fee';
    amount: string;
    from: string;
    to: string;
    description?: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/wallet/transaction', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }
}

// Export the error class for use in components
export { ApiErrorClass };