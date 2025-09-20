'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Eye, 
  Clock, 
  Shield, 
  User, 
  Building, 
  Search, 
  Filter, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  FileText,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

interface AccessLog {
  id: string;
  accessor: string;
  accessorType: 'doctor' | 'hospital' | 'patient' | 'system';
  accessedResource: string;
  accessType: 'view' | 'download' | 'share' | 'edit';
  timestamp: string;
  location: string;
  ipAddress: string;
  deviceInfo: string;
  purpose: string;
  status: 'authorized' | 'suspicious' | 'blocked';
  qrCodeUsed?: boolean;
}

export default function PatientAccessLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [accessorFilter, setAccessorFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('7days');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with actual API calls
  const accessLogs: AccessLog[] = [
    {
      id: 'log1',
      accessor: 'Dr. Sarah Chen',
      accessorType: 'doctor',
      accessedResource: 'Blood Test Results - CBC Panel',
      accessType: 'view',
      timestamp: '2024-07-20T14:30:00Z',
      location: 'City Hospital - Cardiology Dept',
      ipAddress: '192.168.1.45',
      deviceInfo: 'MacBook Pro - Chrome 126.0',
      purpose: 'Treatment planning and diagnosis review',
      status: 'authorized',
      qrCodeUsed: true
    },
    {
      id: 'log2',
      accessor: 'City Hospital Admin',
      accessorType: 'hospital',
      accessedResource: 'Emergency Contact Information',
      accessType: 'view',
      timestamp: '2024-07-20T09:15:00Z',
      location: 'City Hospital - Emergency Dept',
      ipAddress: '192.168.1.112',
      deviceInfo: 'iPad - Safari 17.0',
      purpose: 'Emergency patient identification',
      status: 'authorized'
    },
    {
      id: 'log3',
      accessor: 'Dr. Michael Rodriguez',
      accessorType: 'doctor',
      accessedResource: 'X-Ray Chest Scan',
      accessType: 'download',
      timestamp: '2024-07-19T16:45:00Z',
      location: 'City Hospital - Emergency Dept',
      ipAddress: '192.168.1.78',
      deviceInfo: 'Windows 11 - Edge 126.0',
      purpose: 'Second opinion consultation',
      status: 'authorized',
      qrCodeUsed: true
    },
    {
      id: 'log4',
      accessor: 'John Smith',
      accessorType: 'patient',
      accessedResource: 'Complete Medical History',
      accessType: 'share',
      timestamp: '2024-07-19T10:20:00Z',
      location: 'Home - Remote Access',
      ipAddress: '98.207.254.123',
      deviceInfo: 'iPhone 15 - Safari Mobile',
      purpose: 'Shared with new healthcare provider',
      status: 'authorized'
    },
    {
      id: 'log5',
      accessor: 'Unknown User',
      accessorType: 'system',
      accessedResource: 'Patient Profile',
      accessType: 'view',
      timestamp: '2024-07-18T23:45:00Z',
      location: 'Unknown Location',
      ipAddress: '45.123.78.90',
      deviceInfo: 'Unknown Device - Unknown Browser',
      purpose: 'Unauthorized access attempt',
      status: 'blocked'
    },
    {
      id: 'log6',
      accessor: 'Dr. Emily Park',
      accessorType: 'doctor',
      accessedResource: 'Vaccination Records',
      accessType: 'view',
      timestamp: '2024-07-18T11:30:00Z',
      location: 'Pediatric Clinic - Downtown',
      ipAddress: '192.168.2.56',
      deviceInfo: 'Windows 10 - Chrome 126.0',
      purpose: 'Pre-appointment record review',
      status: 'authorized'
    }
  ];

  const getAccessorIcon = (type: string) => {
    switch (type) {
      case 'doctor':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'hospital':
        return <Building className="w-4 h-4 text-green-600" />;
      case 'patient':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'system':
        return <Shield className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authorized':
        return 'bg-green-100 text-green-800';
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authorized':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspicious':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'download':
        return <Download className="w-4 h-4 text-green-600" />;
      case 'share':
        return <RefreshCw className="w-4 h-4 text-purple-600" />;
      case 'edit':
        return <FileText className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredLogs = accessLogs.filter(log => {
    const matchesSearch = log.accessor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.accessedResource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccessor = accessorFilter === 'all' || log.accessorType === accessorFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    // Time filter logic would go here
    return matchesSearch && matchesAccessor && matchesStatus;
  });

  const totalAccesses = accessLogs.length;
  const authorizedAccesses = accessLogs.filter(log => log.status === 'authorized').length;
  const blockedAccesses = accessLogs.filter(log => log.status === 'blocked').length;
  const qrCodeAccesses = accessLogs.filter(log => log.qrCodeUsed).length;

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="space-y-6">
        <PageHeader
          title="Access Logs"
          description="Monitor who has accessed your medical records and when"
        >
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Accesses"
            value={totalAccesses.toString()}
            change={{ value: "Last 30 days", trend: "neutral" }}
            icon={<Eye className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Authorized"
            value={authorizedAccesses.toString()}
            change={{ value: `${Math.round((authorizedAccesses / totalAccesses) * 100)}% of total`, trend: "up" }}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Blocked Attempts"
            value={blockedAccesses.toString()}
            change={{ value: "Security incidents", trend: "down" }}
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          />
          <StatCard
            title="QR Code Uses"
            value={qrCodeAccesses.toString()}
            change={{ value: "Secure access method", trend: "up" }}
            icon={<Shield className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              value={accessorFilter}
              onChange={(e) => setAccessorFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Accessors</option>
              <option value="doctor">Doctors</option>
              <option value="hospital">Hospitals</option>
              <option value="patient">Patients</option>
              <option value="system">System</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="authorized">Authorized</option>
              <option value="suspicious">Suspicious</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </Card>

        {/* Access Logs */}
        <Card title="Recent Access Activity">
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getAccessorIcon(log.accessorType)}
                    <div>
                      <h3 className="font-medium text-gray-900">{log.accessor}</h3>
                      <p className="text-sm text-gray-500 capitalize">{log.accessorType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.qrCodeUsed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        QR Code
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span className="ml-1 capitalize">{log.status}</span>
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    {getAccessTypeIcon(log.accessType)}
                    <span className="font-medium text-gray-900">{log.accessedResource}</span>
                  </div>
                  <p className="text-sm text-gray-600">{log.purpose}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{log.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    <span>{log.ipAddress}</span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 mr-1" />
                    <span>{log.deviceInfo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No access logs found</h3>
              <p className="text-gray-500">No logs match your current filters.</p>
            </div>
          )}
        </Card>

        {/* Security Summary */}
        <Card title="Security Summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{authorizedAccesses}</div>
              <div className="text-sm text-green-700">Authorized Accesses</div>
            </div>
            <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {accessLogs.filter(log => log.status === 'suspicious').length}
              </div>
              <div className="text-sm text-yellow-700">Suspicious Activities</div>
            </div>
            <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{blockedAccesses}</div>
              <div className="text-sm text-red-700">Blocked Attempts</div>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
