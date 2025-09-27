// frontend/src/lib/services/payment.service.ts
import { config } from '../config/env';
import { ethers } from 'ethers';

const API_BASE_URL = config.api.baseUrl;

export interface PaymentRequirements {
  receivingAddress: string;
  facilitatorUrl: string;
  price: string;
  network: string;
  tokenType?: string;
  config: {
    description: string;
    inputSchema: any;
  };
}

export class PaymentService {
  static async getPaymentRequirements(service: string): Promise<PaymentRequirements> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/requirements/${service}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching payment requirements: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getPaymentRequirements:', error);
      throw error;
    }
  }

  static async processPayment(
    paymentDetails: PaymentRequirements,
    requestOptions: RequestInit,
    endpoint: string
  ): Promise<Response> {
    try {
      // Check if MetaMask is available
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not available. Please install MetaMask to make payments.');
      }

      // Step 1: Try to make the request without payment header first
      const initialResponse = await fetch(`${API_BASE_URL}/api${endpoint}`, requestOptions);

      // If request is successful or not a payment required response, return it
      if (initialResponse.status !== 402) {
        return initialResponse;
      }

      // Step 2: Extract payment details from the 402 response
      const responseData = await initialResponse.json();
      const paymentDetails = responseData.paymentDetails;
      console.log('Payment details:', paymentDetails);

      // Step 3: Request accounts from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found in MetaMask. Please connect your wallet.');
      }

      // Create an ethers provider connected to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Check if we're on Polygon Amoy testnet (chainId 80002)
      if (chainId !== '0x13882') {
        try {
          // Try to switch to Polygon Amoy testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13882' }], // Polygon Amoy testnet
          });
        } catch (switchError: any) {
          // If the network doesn't exist in MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x13882',
                    chainName: 'Polygon Amoy Testnet',
                    nativeCurrency: {
                      name: 'MATIC',
                      symbol: 'MATIC',
                      decimals: 18
                    },
                    rpcUrls: ['https://rpc-amoy.polygon.technology'],
                    blockExplorerUrls: ['https://amoy.polygonscan.com'],
                  },
                ],
              });
            } catch (addError) {
              console.error('Error adding Polygon network:', addError);
              throw new Error('Failed to add Polygon network to MetaMask. Please try adding the network manually.');
            }
          } else {
            throw new Error('Failed to switch network in MetaMask');
          }
        }
      }

      // Step 4: Send POL payment transaction
      console.log(`Sending ${paymentDetails.price} POL to ${paymentDetails.receivingAddress}`);

      // Convert the amount to wei (18 decimals for POL/MATIC)
      const amountInWei = ethers.parseUnits(paymentDetails.price, 18);
      
      // Send the transaction using native POL/MATIC tokens
      const tx = await signer.sendTransaction({
        to: paymentDetails.receivingAddress,
        value: amountInWei
      });
      
      console.log('Transaction sent:', tx);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Make the request again, this time with payment header
      const paymentResult = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'x-pol-payment-tx': tx.hash,
        },
      });

      // Check payment response
      if (paymentResult.headers.has('x-payment-response')) {
        const responseHeader = paymentResult.headers.get('x-payment-response');
        if (responseHeader) {
          try {
            // Try to parse the payment response
            const paymentResponse = JSON.parse(responseHeader);
            console.log('Payment details:', paymentResponse);
            
            // Store transaction info for reference
            if (paymentResponse && paymentResponse.transactionHash) {
              try {
                // Record the transaction in our system
                await this.recordTransaction({
                  transactionHash: paymentResponse.transactionHash,
                  amount: paymentDetails.price,
                  from: accounts[0],
                  to: paymentDetails.receivingAddress,
                  service: endpoint.split('/').pop() || 'unknown'
                });
              } catch (e) {
                console.error('Failed to record transaction:', e);
              }
            }
          } catch (e) {
            console.error('Failed to parse payment response:', e);
          }
        }
      }

      return paymentResult;
    } catch (error) {
      console.error('Error in processPayment:', error);
      throw error;
    }
  }
  
  static async recordTransaction(transactionData: {
    transactionHash: string;
    amount: string;
    from: string;
    to: string;
    service: string;
  }): Promise<boolean> {
    try {
      // Here we'd typically send the transaction data to our backend
      // For now, we'll just log it and store in localStorage for reference
      console.log('Recording transaction:', transactionData);
      
      // Save to localStorage for demo purposes
      const transactions = JSON.parse(localStorage.getItem('medichain-transactions') || '[]');
      transactions.push({
        ...transactionData,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('medichain-transactions', JSON.stringify(transactions));
      
      // In a real implementation, we would send this to our backend
      // const response = await fetch(`${API_BASE_URL}/api/wallet/transaction`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('medichain-token')}`,
      //   },
      //   body: JSON.stringify({
      //     transactionHash: transactionData.transactionHash,
      //     type: 'fee',
      //     amount: transactionData.amount,
      //     from: transactionData.from,
      //     to: transactionData.to,
      //     description: `Payment for ${transactionData.service}`,
      //   }),
      // });
      
      return true;
    } catch (error) {
      console.error('Error recording transaction:', error);
      return false;
    }
  }

  static async verifyPayment(paymentId: string): Promise<{success: boolean; message: string}> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('medichain-token')}`,
        },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) {
        throw new Error(`Error verifying payment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in verifyPayment:', error);
      throw error;
    }
  }
  
  /**
   * Get transaction history for the connected wallet
   */
  static async getTransactionHistory(): Promise<Array<{
    transactionHash: string;
    amount: string;
    from: string;
    to: string;
    service: string;
    timestamp: string;
  }>> {
    try {
      // In a production app, we would fetch from the backend
      // For demo, we'll read from localStorage
      const transactions = JSON.parse(localStorage.getItem('medichain-transactions') || '[]');
      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }
}
