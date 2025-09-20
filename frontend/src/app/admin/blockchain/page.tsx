'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Database, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Hash,
  Link,
  Zap,
  RefreshCw,
  ExternalLink,
  Copy
} from 'lucide-react';

interface BlockchainStats {
  totalTransactions: number;
  pendingTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageBlockTime: number;
  networkStatus: 'healthy' | 'congested' | 'degraded';
  lastBlockHeight: number;
  gasPrice: number;
}

interface Transaction {
  id: string;
  hash: string;
  blockNumber: number;
  timestamp: string;
  type: 'record_hash' | 'access_grant' | 'revoke_access' | 'user_registration';
  status: 'confirmed' | 'pending' | 'failed';
  gasUsed: number;
  gasPrice: number;
  fromAddress: string;
  description: string;
}

export default function BlockchainStatusPage() {
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual blockchain API calls
  const stats: BlockchainStats = {
    totalTransactions: 8765,
    pendingTransactions: 23,
    successfulTransactions: 8742,
    failedTransactions: 23,
    averageBlockTime: 2.1,
    networkStatus: 'healthy',
    lastBlockHeight: 45123678,
    gasPrice: 20
  };

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      hash: '0x1234...abcd',
      blockNumber: 45123678,
      timestamp: '2024-07-20T10:30:00Z',
      type: 'record_hash',
      status: 'confirmed',
      gasUsed: 21000,
      gasPrice: 20,
      fromAddress: '0x9876...5432',
      description: 'Patient record hash stored for Sarah Johnson'
    },
    {
      id: '2',
      hash: '0x5678...efgh',
      blockNumber: 45123677,
      timestamp: '2024-07-20T10:28:00Z',
      type: 'access_grant',
      status: 'confirmed',
      gasUsed: 45000,
      gasPrice: 22,
      fromAddress: '0x1111...2222',
      description: 'Access granted to Dr. Smith for patient records'
    },
    {
      id: '3',
      hash: '0x9abc...def0',
      blockNumber: 0,
      timestamp: '2024-07-20T10:25:00Z',
      type: 'record_hash',
      status: 'pending',
      gasUsed: 0,
      gasPrice: 21,
      fromAddress: '0x3333...4444',
      description: 'New X-ray record hash submission'
    },
    {
      id: '4',
      hash: '0xfeda...bc98',
      blockNumber: 0,
      timestamp: '2024-07-20T10:20:00Z',
      type: 'user_registration',
      status: 'failed',
      gasUsed: 0,
      gasPrice: 25,
      fromAddress: '0x5555...6666',
      description: 'User registration transaction failed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'record_hash':
        return 'bg-blue-100 text-blue-800';
      case 'access_grant':
        return 'bg-green-100 text-green-800';
      case 'revoke_access':
        return 'bg-red-100 text-red-800';
      case 'user_registration':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'congested':
        return 'text-yellow-600';
      case 'degraded':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ProtectedRoute allowedRoles={['system_admin']}>
      <div className="space-y-6">
        <PageHeader
          title="Blockchain Status"
          description="Monitor Polygon blockchain integration and transaction status"
        >
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="primary">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          </div>
        </PageHeader>

        {/* Network Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${getNetworkStatusColor(stats.networkStatus)}`} />
                <span className="text-lg font-semibold">Network Status</span>
              </div>
              <span className={`text-lg font-bold capitalize ${getNetworkStatusColor(stats.networkStatus)}`}>
                {stats.networkStatus}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Latest Block</div>
              <div className="text-lg font-semibold text-gray-900">#{stats.lastBlockHeight.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions.toLocaleString()}
            change={{ value: "+123 today", trend: "up" }}
            icon={<Database className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Pending Transactions"
            value={stats.pendingTransactions.toString()}
            change={{ value: "In mempool", trend: "neutral" }}
            icon={<Clock className="w-6 h-6 text-yellow-600" />}
          />
          <StatCard
            title="Success Rate"
            value={`${Math.round((stats.successfulTransactions / stats.totalTransactions) * 100)}%`}
            change={{ value: "High reliability", trend: "up" }}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Avg Block Time"
            value={`${stats.averageBlockTime}s`}
            change={{ value: "Optimal performance", trend: "up" }}
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Network Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Network Information">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Network</span>
                <span className="font-medium">Polygon Mainnet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Chain ID</span>
                <span className="font-medium">137</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Gas Price</span>
                <span className="font-medium">{stats.gasPrice} Gwei</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Block Height</span>
                <span className="font-medium">#{stats.lastBlockHeight.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Block Time</span>
                <span className="font-medium">{stats.averageBlockTime} seconds</span>
              </div>
            </div>
          </Card>

          <Card title="Transaction Types">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Record Hashes</span>
                <span className="font-medium">6,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Access Grants</span>
                <span className="font-medium">1,567</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Access Revocations</span>
                <span className="font-medium">432</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Registrations</span>
                <span className="font-medium">532</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card title="Recent Transactions">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Block
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gas Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm text-gray-900">{tx.hash}</span>
                        <button 
                          onClick={() => copyToClipboard(tx.hash)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(tx.type)}`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(tx.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.blockNumber ? `#${tx.blockNumber.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 text-gray-400 mr-1" />
                        {tx.gasUsed ? tx.gasUsed.toLocaleString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Copy className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pending Transactions Alert */}
        {stats.pendingTransactions > 20 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">High Pending Transactions</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  There are {stats.pendingTransactions} pending transactions. Network may be congested.
                </p>
                <div className="mt-3">
                  <Button size="sm" variant="outline">
                    Monitor Network Status
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Contract Addresses */}
        <Card title="Smart Contract Addresses">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">MediChain Registry</div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm text-gray-600">0x1234...5678</span>
                <button 
                  onClick={() => copyToClipboard('0x1234567890abcdef1234567890abcdef12345678')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">Access Control</div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm text-gray-600">0xabcd...ef01</span>
                <button 
                  onClick={() => copyToClipboard('0xabcdef0123456789abcdef0123456789abcdef01')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
