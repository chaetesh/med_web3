'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Shield, 
  Eye, 
  Download, 
  Filter, 
  Calendar,
  User,
  FileText,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'view' | 'upload' | 'share' | 'download' | 'delete' | 'modify';
  resourceType: 'patient_record' | 'user_account' | 'hospital_data' | 'system_config';
  resourceId: string;
  resourceName: string;
  ipAddress: string;
  location: string;
  success: boolean;
  details?: string;
}

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Mock data - replace with actual API calls
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-07-20T10:30:00Z',
      userId: 'dr001',
      userName: 'Dr. John Smith',
      userRole: 'doctor',
      action: 'view',
      resourceType: 'patient_record',
      resourceId: 'patient_123',
      resourceName: 'Sarah Johnson - Medical Record',
      ipAddress: '192.168.1.100',
      location: 'New York, NY',
      success: true,
      details: 'Accessed patient record for consultation'
    },
    {
      id: '2',
      timestamp: '2024-07-20T09:15:00Z',
      userId: 'patient456',
      userName: 'Michael Chen',
      userRole: 'patient',
      action: 'upload',
      resourceType: 'patient_record',
      resourceId: 'record_789',
      resourceName: 'Blood Test Results',
      ipAddress: '203.0.113.45',
      location: 'San Francisco, CA',
      success: true,
      details: 'Uploaded new blood test results'
    },
    {
      id: '3',
      timestamp: '2024-07-20T08:45:00Z',
      userId: 'admin_001',
      userName: 'System Administrator',
      userRole: 'system_admin',
      action: 'modify',
      resourceType: 'system_config',
      resourceId: 'ai_config_001',
      resourceName: 'AI Processing Settings',
      ipAddress: '10.0.0.50',
      location: 'Internal Network',
      success: true,
      details: 'Updated AI summary generation settings'
    },
    {
      id: '4',
      timestamp: '2024-07-20T07:20:00Z',
      userId: 'dr002',
      userName: 'Dr. Emily Parker',
      userRole: 'doctor',
      action: 'share',
      resourceType: 'patient_record',
      resourceId: 'patient_456',
      resourceName: 'X-Ray Results - James Wilson',
      ipAddress: '192.168.1.101',
      location: 'Chicago, IL',
      success: false,
      details: 'Failed to share - insufficient permissions'
    },
    {
      id: '5',
      timestamp: '2024-07-19T16:30:00Z',
      userId: 'hospital_admin_01',
      userName: 'Hospital Admin - City General',
      userRole: 'hospital_admin',
      action: 'view',
      resourceType: 'hospital_data',
      resourceId: 'hospital_stats_001',
      resourceName: 'Monthly Usage Report',
      ipAddress: '172.16.0.10',
      location: 'Boston, MA',
      success: true,
      details: 'Generated monthly hospital usage report'
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'upload':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'share':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'download':
        return <Download className="w-4 h-4 text-indigo-600" />;
      case 'delete':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'modify':
        return <FileText className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view':
        return 'bg-blue-100 text-blue-800';
      case 'upload':
        return 'bg-green-100 text-green-800';
      case 'share':
        return 'bg-purple-100 text-purple-800';
      case 'download':
        return 'bg-indigo-100 text-indigo-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'modify':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      case 'doctor':
        return 'bg-green-100 text-green-800';
      case 'hospital_admin':
        return 'bg-purple-100 text-purple-800';
      case 'system_admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesRole = userRoleFilter === 'all' || log.userRole === userRoleFilter;
    
    return matchesSearch && matchesAction && matchesRole;
  });

  const totalActions = auditLogs.length;
  const successfulActions = auditLogs.filter(log => log.success).length;
  const failedActions = auditLogs.filter(log => !log.success).length;
  const todayActions = auditLogs.filter(log => 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <ProtectedRoute allowedRoles={['system_admin']}>
      <div className="space-y-6">
        <PageHeader
          title="Security Audit Logs"
          description="Monitor all system activities and data access across the platform"
        >
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="primary">
              <Shield className="w-4 h-4 mr-2" />
              Security Report
            </Button>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Actions"
            value={totalActions.toString()}
            change={{ value: `${todayActions} today`, trend: "neutral" }}
            icon={<Shield className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Successful Actions"
            value={successfulActions.toString()}
            change={{ value: `${Math.round((successfulActions / totalActions) * 100)}% success rate`, trend: "up" }}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Failed Actions"
            value={failedActions.toString()}
            change={{ value: "Requires attention", trend: failedActions > 0 ? "down" : "neutral" }}
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          />
          <StatCard
            title="Data Access Events"
            value="847"
            change={{ value: "Last 24 hours", trend: "neutral" }}
            icon={<Eye className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="view">View</option>
              <option value="upload">Upload</option>
              <option value="share">Share</option>
              <option value="download">Download</option>
              <option value="modify">Modify</option>
              <option value="delete">Delete</option>
            </select>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="hospital_admin">Hospital Admins</option>
              <option value="system_admin">System Admins</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1day">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(log.userRole)}`}>
                            {log.userRole.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="ml-1 capitalize">{log.action}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.resourceName}</div>
                      <div className="text-sm text-gray-500">{log.resourceType.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <div>
                          <div>{log.location}</div>
                          <div className="text-xs text-gray-500">{log.ipAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.success ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Security Alerts */}
        {failedActions > 0 && (
          <Card className="border-red-200 bg-red-50">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Security Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  {failedActions} failed action{failedActions !== 1 ? 's' : ''} detected in the recent logs. 
                  Please review these events for potential security issues.
                </p>
                <div className="mt-3">
                  <Button size="sm" variant="danger">
                    Review Failed Actions
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
