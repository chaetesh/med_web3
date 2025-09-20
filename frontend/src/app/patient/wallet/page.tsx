'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Wallet, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Gift,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Copy,
  Send,
  Download,
  RefreshCw
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'payment' | 'receipt' | 'reward' | 'fee' | 'refund';
  amount: number;
  currency: 'MEDI' | 'ETH' | 'USD';
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  from?: string;
  to?: string;
  txHash?: string;
  gasFee?: number;
}

interface WalletBalance {
  currency: 'MEDI' | 'ETH' | 'USD';
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
  name: string;
}

export default function PatientWalletPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'MEDI' | 'ETH' | 'USD'>('MEDI');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Mock data - replace with actual API calls
  const walletBalances: WalletBalance[] = [
    {
      currency: 'MEDI',
      balance: 2847.52,
      usdValue: 1423.76,
      change24h: 5.2,
      icon: '💊',
      name: 'MediChain Token'
    },
    {
      currency: 'ETH',
      balance: 0.156,
      usdValue: 312.45,
      change24h: -2.1,
      icon: '💎',
      name: 'Ethereum'
    },
    {
      currency: 'USD',
      balance: 150.00,
      usdValue: 150.00,
      change24h: 0,
      icon: '💵',
      name: 'USD Coin'
    }
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx1',
      type: 'reward',
      amount: 50,
      currency: 'MEDI',
      description: 'Data sharing reward - City Hospital',
      date: '2024-07-20T14:30:00Z',
      status: 'completed',
      to: '0x742d35Cc6e60F7b2F8D61b4e8b2B2e8d1F3F4F5F',
      txHash: '0x8ba1f109551bd7b6a1f8e8f4d5e5d4e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5',
      gasFee: 0.002
    },
    {
      id: 'tx2',
      type: 'payment',
      amount: 25,
      currency: 'MEDI',
      description: 'Premium feature subscription',
      date: '2024-07-19T10:15:00Z',
      status: 'completed',
      from: '0x742d35Cc6e60F7b2F8D61b4e8b2B2e8d1F3F4F5F',
      txHash: '0x7ba1f109551bd7b6a1f8e8f4d5e5d4e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5'
    },
    {
      id: 'tx3',
      type: 'receipt',
      amount: 100,
      currency: 'MEDI',
      description: 'Medical consultation payment',
      date: '2024-07-18T16:45:00Z',
      status: 'completed',
      from: 'Dr. Sarah Chen',
      txHash: '0x6ba1f109551bd7b6a1f8e8f4d5e5d4e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5'
    },
    {
      id: 'tx4',
      type: 'reward',
      amount: 25,
      currency: 'MEDI',
      description: 'Weekly health data upload',
      date: '2024-07-17T09:00:00Z',
      status: 'completed',
      txHash: '0x5ba1f109551bd7b6a1f8e8f4d5e5d4e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5'
    },
    {
      id: 'tx5',
      type: 'fee',
      amount: 5,
      currency: 'MEDI',
      description: 'Network transaction fee',
      date: '2024-07-16T13:20:00Z',
      status: 'completed',
      gasFee: 0.001
    }
  ];

  const walletAddress = "0x742d35Cc6e60F7b2F8D61b4e8b2B2e8d1F3F4F5F";

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'receipt':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-purple-600" />;
      case 'fee':
        return <Zap className="w-4 h-4 text-orange-600" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment':
      case 'fee':
        return 'text-red-600';
      case 'receipt':
      case 'reward':
      case 'refund':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  const totalUSDValue = walletBalances.reduce((sum, balance) => sum + balance.usdValue, 0);
  const selectedBalance = walletBalances.find(b => b.currency === selectedCurrency);
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  const totalRewards = transactions
    .filter(t => t.type === 'reward' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="space-y-6">
        <PageHeader
          title="Digital Wallet"
          description="Manage your MediChain tokens and cryptocurrency payments"
        >
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowReceiveModal(true)}>
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Receive
            </Button>
            <Button variant="primary" onClick={() => setShowSendModal(true)}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Value"
            value={showBalance ? `$${totalUSDValue.toFixed(2)}` : '****'}
            change={{ value: "+12.5% this month", trend: "up" }}
            icon={<Wallet className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="MEDI Rewards"
            value={showBalance ? totalRewards.toString() : '****'}
            change={{ value: "This month", trend: "up" }}
            icon={<Gift className="w-6 h-6 text-purple-600" />}
          />
          <StatCard
            title="Transactions"
            value={completedTransactions.toString()}
            change={{ value: `${pendingTransactions} pending`, trend: "neutral" }}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Wallet Security"
            value="Protected"
            change={{ value: "Multi-signature", trend: "neutral" }}
            icon={<Shield className="w-6 h-6 text-green-600" />}
          />
        </div>

        {/* Wallet Balances */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Wallet Balances</h3>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              {showBalance ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showBalance ? 'Hide' : 'Show'} Balance
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {walletBalances.map((balance) => (
              <div
                key={balance.currency}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedCurrency === balance.currency ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedCurrency(balance.currency)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{balance.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{balance.currency}</div>
                      <div className="text-sm text-gray-500">{balance.name}</div>
                    </div>
                  </div>
                  <div className={`flex items-center text-sm ${balance.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {balance.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(balance.change24h)}%
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {showBalance ? `${balance.balance.toFixed(2)} ${balance.currency}` : '****'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {showBalance ? `≈ $${balance.usdValue.toFixed(2)} USD` : '****'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Send className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Send Payment</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <ArrowDownLeft className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Receive</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <Plus className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Buy MEDI</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium">Stake Tokens</span>
            </button>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card title="Recent Transactions">
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()} • {new Date(transaction.date).toLocaleTimeString()}
                    </div>
                    {transaction.txHash && (
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <span className="mr-1">TX:</span>
                        <span className="font-mono">{transaction.txHash.substring(0, 10)}...{transaction.txHash.substring(transaction.txHash.length - 6)}</span>
                        <button 
                          onClick={() => copyToClipboard(transaction.txHash!)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'payment' || transaction.type === 'fee' ? '-' : '+'}
                      {transaction.amount} {transaction.currency}
                    </div>
                    {transaction.gasFee && (
                      <div className="text-xs text-gray-500">Gas: {transaction.gasFee} ETH</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transaction.status)}
                    <span className="text-sm text-gray-500 capitalize">{transaction.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button variant="outline">
              View All Transactions
            </Button>
          </div>
        </Card>

        {/* Wallet Address */}
        <Card title="Wallet Address">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500 mb-1">Your wallet address:</div>
              <div className="font-mono text-gray-900">{walletAddress}</div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => copyToClipboard(walletAddress)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Send Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Payment</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      {walletBalances.map(balance => (
                        <option key={balance.currency} value={balance.currency}>
                          {balance.currency} - {balance.balance.toFixed(2)} available
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Payment for..."
                    />
                  </div>
                </form>
                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowSendModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1">
                    Send Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receive Modal */}
        {showReceiveModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Receive Payment</h3>
                
                <div className="text-center mb-6">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-gray-200 rounded-lg mx-auto flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Wallet className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                      <div className="text-xs text-gray-500">QR Code for Address</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Scan this QR code to send payment to your wallet</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Wallet Address</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={walletAddress}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                      />
                      <button 
                        onClick={() => copyToClipboard(walletAddress)}
                        className="p-2 text-blue-600 hover:text-blue-800 border border-gray-300 rounded-lg"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Amount (optional)</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {walletBalances.map(balance => (
                          <option key={balance.currency} value={balance.currency}>
                            {balance.currency}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Button variant="primary" onClick={() => setShowReceiveModal(false)} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
