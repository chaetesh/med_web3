'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import {
  SystemAdminApiService,
  SystemStats,
  User,
  Hospital,
  SystemLog,
  BackupInfo,
  ApiErrorClass
} from '@/lib/services/system-admin.service';
import { 
  Users,
  Building2,
  FileText,
  Database,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  Server,
  HardDrive,
  Cpu,
  Zap,
  Eye,
  UserX,
  UserCheck,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react';

export default function SystemAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentHospitals, setRecentHospitals] = useState<Hospital[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'hospitals' | 'logs' | 'backups' | 'health'>('overview');
  const [userFilter, setUserFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [logLevelFilter, setLogLevelFilter] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsData,
        usersData,
        hospitalsData,
        logsData,
        backupsData,
        healthData
      ] = await Promise.all([
        SystemAdminApiService.getSystemStats().catch(() => null),
        SystemAdminApiService.getUsers({ limit: 10 }).catch(() => ({ users: [] })),
        SystemAdminApiService.getHospitals({ limit: 10 }).catch(() => ({ hospitals: [] })),
        SystemAdminApiService.getSystemLogs({ limit: 20 }).catch(() => ({ logs: [] })),
        SystemAdminApiService.getBackups().catch(() => []),
        SystemAdminApiService.getSystemHealth().catch(() => null)
      ]);

      setSystemStats(statsData);
      setRecentUsers(usersData.users || []);
      setRecentHospitals(hospitalsData.hospitals || []);
      setSystemLogs(logsData.logs || []);
      setBackups(backupsData || []);
      setSystemHealth(healthData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof ApiErrorClass ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      switch (action) {
        case 'activate':
          await SystemAdminApiService.updateUserStatus(userId, true);
          break;
        case 'deactivate':
          await SystemAdminApiService.updateUserStatus(userId, false);
          break;
        case 'delete':
          await SystemAdminApiService.deleteUser(userId);
          break;
      }
      
      // Reload users data
      const usersData = await SystemAdminApiService.getUsers({ limit: 10 });
      setRecentUsers(usersData.users);
      
    } catch (error) {
      console.error(`Error performing ${action} on user:`, error);
      alert(`Failed to ${action} user. Please try again.`);
    }
  };

  const handleCreateBackup = async (type: 'database' | 'files' | 'blockchain') => {
    try {
      await SystemAdminApiService.createBackup(type);
      
      // Reload backups
      const backupsData = await SystemAdminApiService.getBackups();
      setBackups(backupsData);
      
      alert(`${type} backup created successfully!`);
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup. Please try again.');
    }
  };

  const handleClearCache = async () => {
    try {
      await SystemAdminApiService.clearCache();
      alert('System cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache. Please try again.');
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getServiceStatusIcon = (status: string) => {
    switch (status) {
      case 'up': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'down': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'hospital_admin': return 'bg-purple-100 text-purple-800';
      case 'system_admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600';
      case 'warn': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      case 'debug': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['system_admin']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading system dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['system_admin']}>
      <div className="space-y-6">
        <PageHeader
          title="System Administration"
          description="Monitor and manage the entire MediChain.AI platform"
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
            <Button variant="outline" onClick={handleClearCache}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="primary">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </PageHeader>

        {/* System Health Alert */}
        {systemHealth && systemHealth.status !== 'healthy' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">System Health Warning</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  System status: {systemHealth.status}. Some services may be degraded.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={systemStats?.totalUsers.toLocaleString() || '0'}
            change={{ value: "+234 this week", trend: "up" }}
            icon={<Users className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Active Hospitals"
            value={systemStats?.totalHospitals.toString() || '0'}
            change={{ value: "+5 this month", trend: "up" }}
            icon={<Building2 className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Medical Records"
            value={systemStats?.totalRecords.toLocaleString() || '0'}
            change={{ value: "+1,234 today", trend: "up" }}
            icon={<FileText className="w-6 h-6 text-purple-600" />}
          />
          <StatCard
            title="System Health"
            value={systemHealth?.status || 'Unknown'}
            change={{ value: `${SystemAdminApiService.formatUptime(systemHealth?.uptime || 0)}`, trend: "up" }}
            icon={<Activity className="w-6 h-6 text-orange-600" />}
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'hospitals', label: 'Hospitals', icon: Building2 },
              { key: 'logs', label: 'System Logs', icon: FileText },
              { key: 'backups', label: 'Backups', icon: Database },
              { key: 'health', label: 'System Health', icon: Server }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Recent Activity">
              <div className="space-y-4">
                {systemLogs.slice(0, 5).map((log) => (
                  <div key={log._id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      log.level === 'error' ? 'bg-red-500' :
                      log.level === 'warn' ? 'bg-yellow-500' :
                      log.level === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{log.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()} • {log.userEmail || 'System'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="System Performance">
              {systemHealth ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CPU Usage</span>
                    <span className="font-medium">{Math.round(systemHealth.cpuUsage)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="font-medium">{Math.round(systemHealth.memoryUsage)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Disk Usage</span>
                    <span className="font-medium">{Math.round(systemHealth.diskUsage)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-medium">{SystemAdminApiService.formatUptime(systemHealth.uptime)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">System health data unavailable</p>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card title="User Management">
            <div className="mb-4 flex space-x-4">
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="hospital_admin">Hospital Admins</option>
                <option value="system_admin">System Admins</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers
                    .filter(user => userFilter === 'all' || user.role === userFilter)
                    .map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleUserAction(user._id, 'delete')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'backups' && (
          <Card title="Backup Management">
            <div className="mb-4 flex space-x-2">
              <Button onClick={() => handleCreateBackup('database')}>
                <Database className="w-4 h-4 mr-2" />
                Database Backup
              </Button>
              <Button variant="outline" onClick={() => handleCreateBackup('files')}>
                <FileText className="w-4 h-4 mr-2" />
                Files Backup
              </Button>
              <Button variant="outline" onClick={() => handleCreateBackup('blockchain')}>
                <Shield className="w-4 h-4 mr-2" />
                Blockchain Backup
              </Button>
            </div>

            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{backup.filename}</h4>
                    <p className="text-sm text-gray-500">
                      {backup.type} • {SystemAdminApiService.formatBytes(backup.size)} • 
                      {new Date(backup.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                      backup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {backup.status}
                    </span>
                    {backup.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'health' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Service Status">
              {systemHealth ? (
                <div className="space-y-4">
                  {Object.entries(systemHealth.services).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getServiceStatusIcon(status as string)}
                        <span className="font-medium capitalize">{service}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {status as string}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Service status unavailable</p>
              )}
            </Card>

            <Card title="Resource Usage">
              {systemHealth ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                      <span className="text-sm text-gray-500">{Math.round(systemHealth.cpuUsage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                      <span className="text-sm text-gray-500">{Math.round(systemHealth.memoryUsage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.memoryUsage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                      <span className="text-sm text-gray-500">{Math.round(systemHealth.diskUsage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.diskUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Resource data unavailable</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}