'use client';

import { useState, useEffect, useCallback } from 'react';

interface MetaMaskAccount {
  address: string;
  balance?: string;
}

interface MetaMaskState {
  isConnected: boolean;
  account: MetaMaskAccount | null;
  isLoading: boolean;
  error: string | null;
  chainId: string | null;
}

interface UseMetaMaskReturn extends MetaMaskState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToMainnet: () => Promise<void>;
  switchToSepolia: () => Promise<void>;
  getBalance: () => Promise<string | null>;
  getTokenBalance: (tokenAddress: string, decimals?: number) => Promise<string | null>;
  signMessage: (message: string) => Promise<string | null>;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
  estimateGas: (to: string, amount: string) => Promise<string | null>;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

export const useMetaMask = (): UseMetaMaskReturn => {
  const [state, setState] = useState<MetaMaskState>({
    isConnected: false,
    account: null,
    isLoading: false,
    error: null,
    chainId: null,
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum?.isMetaMask;
  }, []);

  // Get current accounts
  const getCurrentAccount = useCallback(async () => {
    if (!isMetaMaskInstalled()) return null;

    try {
      const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }, [isMetaMaskInstalled]);

  // Get current chain ID
  const getCurrentChainId = useCallback(async () => {
    if (!isMetaMaskInstalled()) return null;

    try {
      const chainId = await window.ethereum!.request({ method: 'eth_chainId' });
      return chainId;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return null;
    }
  }, [isMetaMaskInstalled]);

  // Get account balance
  const getBalance = useCallback(async (): Promise<string | null> => {
    if (!isMetaMaskInstalled() || !state.account) return null;

    try {
      const balance = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [state.account.address, 'latest'],
      });
      
      // Convert from wei to ether
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInEth.toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }, [isMetaMaskInstalled, state.account]);

  // Get ERC-20 token balance
  const getTokenBalance = useCallback(async (tokenAddress: string, decimals: number = 18): Promise<string | null> => {
    if (!isMetaMaskInstalled() || !state.account) {
      console.log('MetaMask not installed or no account');
      return null;
    }

    try {
      console.log('Fetching token balance for:', tokenAddress);
      console.log('User address:', state.account.address);
      
      // Validate token address format
      if (!tokenAddress || !tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.error('Invalid token address format:', tokenAddress);
        return null;
      }

      // ERC-20 balanceOf function signature: balanceOf(address)
      const paddedAddress = state.account.address.slice(2).padStart(64, '0');
      const data = `0x70a08231${paddedAddress}`;
      
      console.log('Making eth_call with data:', data);
      
      const balance = await window.ethereum!.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: data
        }, 'latest'],
      });
      
      console.log('Raw balance response:', balance);
      
      // Check if balance is valid hex
      if (!balance || balance === '0x' || balance === '0x0') {
        console.log('Balance is zero or empty');
        return '0.0000';
      }
      
      // Convert from token units to human readable format
      const balanceInWei = parseInt(balance, 16);
      console.log('Balance in wei:', balanceInWei);
      
      if (isNaN(balanceInWei)) {
        console.error('Failed to parse balance as number');
        return '0.0000';
      }
      
      const balanceInTokens = balanceInWei / Math.pow(10, decimals);
      const formattedBalance = balanceInTokens.toFixed(4);
      
      console.log('Final token balance:', formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      console.error('Error details:', {
        tokenAddress,
        userAddress: state.account?.address,
        decimals,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }, [isMetaMaskInstalled, state.account]);

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' });
      const chainId = await getCurrentChainId();

      if (accounts.length > 0) {
        const account: MetaMaskAccount = { address: accounts[0] };
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          account,
          chainId,
          isLoading: false,
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to connect to MetaMask',
        isLoading: false,
      }));
    }
  }, [isMetaMaskInstalled, getCurrentChainId]);

  // Disconnect from MetaMask
  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      isLoading: false,
      error: null,
      chainId: null,
    });
  }, []);

  // Switch to Ethereum mainnet
  const switchToMainnet = useCallback(async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum mainnet
      });
    } catch (error) {
      console.error('Error switching to mainnet:', error);
    }
  }, [isMetaMaskInstalled]);

  // Switch to Sepolia testnet
  const switchToSepolia = useCallback(async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
      });
    } catch (error) {
      console.error('Error switching to Sepolia:', error);
      // If the network doesn't exist, try to add it
      if ((error as any).code === 4902) {
        try {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'SEP',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            }],
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
        }
      }
    }
  }, [isMetaMaskInstalled]);

  // Send ETH transaction
  const sendTransaction = useCallback(async (to: string, amount: string): Promise<string | null> => {
    if (!isMetaMaskInstalled() || !state.account) return null;

    try {
      // Convert ETH amount to Wei (hex)
      const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString(16);
      
      const transactionParameters = {
        to: to,
        from: state.account.address,
        value: `0x${amountInWei}`,
      };

      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      return null;
    }
  }, [isMetaMaskInstalled, state.account]);

  // Estimate gas for transaction
  const estimateGas = useCallback(async (to: string, amount: string): Promise<string | null> => {
    if (!isMetaMaskInstalled() || !state.account) return null;

    try {
      const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString(16);
      
      const gasEstimate = await window.ethereum!.request({
        method: 'eth_estimateGas',
        params: [{
          to: to,
          from: state.account.address,
          value: `0x${amountInWei}`,
        }],
      });

      // Convert hex to decimal and then to ETH
      const gasInWei = parseInt(gasEstimate, 16);
      const gasInEth = gasInWei / Math.pow(10, 18);
      return gasInEth.toFixed(6);
    } catch (error) {
      console.error('Error estimating gas:', error);
      return null;
    }
  }, [isMetaMaskInstalled, state.account]);

  // Sign a message
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!isMetaMaskInstalled() || !state.account) return null;

    try {
      const signature = await window.ethereum!.request({
        method: 'personal_sign',
        params: [message, state.account.address],
      });
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  }, [isMetaMaskInstalled, state.account]);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== state.account?.address) {
      setState(prev => ({
        ...prev,
        account: { address: accounts[0] },
      }));
    }
  }, [disconnect, state.account?.address]);

  // Handle chain changes
  const handleChainChanged = useCallback((chainId: string) => {
    console.log('🔄 MetaMask chain changed to:', chainId);
    console.log('🔄 Previous chain was:', state.chainId);
    
    // Update state immediately
    setState(prev => ({ 
      ...prev, 
      chainId,
      // Reset account balance when chain changes to force refresh
      account: prev.account ? { ...prev.account, balance: undefined } : null
    }));
    
    // Force page reload for critical chain changes (mainnet <-> testnet)
    const isMainnet = chainId === '0x1';
    const wasMainnet = state.chainId === '0x1';
    const isSepolia = chainId === '0xaa36a7';
    const wasSepolia = state.chainId === '0xaa36a7';
    
    if ((isMainnet && wasSepolia) || (isSepolia && wasMainnet)) {
      console.log('🔄 Major network change detected, reloading page...');
      setTimeout(() => window.location.reload(), 100);
    }
  }, [state.chainId]);

  // Initialize and set up event listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const initializeMetaMask = async () => {
      const account = await getCurrentAccount();
      const chainId = await getCurrentChainId();

      if (account) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: { address: account },
          chainId,
        }));
      }
    };

    initializeMetaMask();

    // Set up event listeners
    window.ethereum!.on('accountsChanged', handleAccountsChanged);
    window.ethereum!.on('chainChanged', handleChainChanged);

    // Cleanup listeners on unmount
    return () => {
      window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum!.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, getCurrentAccount, getCurrentChainId, handleAccountsChanged, handleChainChanged]);

  return {
    ...state,
    connect,
    disconnect,
    switchToMainnet,
    switchToSepolia,
    getBalance,
    getTokenBalance,
    signMessage,
    sendTransaction,
    estimateGas,
  };
};