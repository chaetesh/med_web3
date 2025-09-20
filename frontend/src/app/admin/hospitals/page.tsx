'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Building2, 
  Search, 
  MapPin, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Ban
} from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  status: 'approved' | 'pending' | 'rejected';
  totalDoctors: number;
  totalPatients: number;
  monthlyRecords: number;
  registeredAt: string;
  adminName: string;
}

export default function HospitalManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with actual API calls
  const hospitals: Hospital[] = [
    {
      id: '1',
      name: 'City General Hospital',
      address: '123 Healthcare Ave',
      city: 'New York',
      email: 'admin@citygeneral.com',
      phone: '+1-555-0123',
      status: 'approved',
      totalDoctors: 45,
      totalPatients: 1247,
      monthlyRecords: 523,
      registeredAt: '2024-01-15',
      adminName: 'Dr. Sarah Chen'
    },
    {
      id: '2',
      name: 'St. Mary Medical Center',
      address: '456 Wellness Blvd',
      city: 'Los Angeles',
      email: 'contact@stmary.org',
      phone: '+1-555-0124',
      status: 'approved',
      totalDoctors: 67,
      totalPatients: 2104,
      monthlyRecords: 842,
      registeredAt: '2024-01-20',
      adminName: 'Michael Rodriguez'
    },
    {
      id: '3',
      name: 'Metro Emergency Hospital',
      address: '789 Emergency St',
      city: 'Chicago',
      email: 'info@metroemergency.com',
      phone: '+1-555-0125',
      status: 'pending',
      totalDoctors: 23,
      totalPatients: 567,
      monthlyRecords: 234,
      registeredAt: '2024-07-18',
      adminName: 'Dr. Jennifer Park'
    },
    {
      id: '4',
      name: 'Community Health Clinic',
      address: '321 Community Dr',
      city: 'Houston',
      email: 'admin@communityhc.org',
      phone: '+1-555-0126',
      status: 'rejected',
      totalDoctors: 12,
      totalPatients: 234,
      monthlyRecords: 67,
      registeredAt: '2024-07-10',
      adminName: 'Robert Kim'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hospital.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalHospitals = hospitals.length;
  const approvedHospitals = hospitals.filter(h => h.status === 'approved').length;
  const pendingHospitals = hospitals.filter(h => h.status === 'pending').length;
  const totalDoctors = hospitals.reduce((sum, h) => sum + h.totalDoctors, 0);

  return (
    <ProtectedRoute allowedRoles={['system_admin']}>
      <div className="space-y-6">
        <PageHeader
          title="Hospital Management"
          description="Manage hospital registrations and monitor hospital activity"
        >
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Hospital
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Hospitals"
            value={totalHospitals.toString()}
            change={{ value: "+3 this month", trend: "up" }}
            icon={<Building2 className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Approved Hospitals"
            value={approvedHospitals.toString()}
            change={{ value: `${Math.round((approvedHospitals / totalHospitals) * 100)}% approved`, trend: "up" }}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Pending Reviews"
            value={pendingHospitals.toString()}
            change={{ value: "Requires action", trend: "neutral" }}
            icon={<Clock className="w-6 h-6 text-yellow-600" />}
          />
          <StatCard
            title="Total Doctors"
            value={totalDoctors.toString()}
            change={{ value: "Across all hospitals", trend: "neutral" }}
            icon={<Users className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <Button variant="outline">
              Export Data
            </Button>
          </div>
        </Card>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {hospital.city}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(hospital.status)}`}>
                    {getStatusIcon(hospital.status)}
                    <span className="ml-1 capitalize">{hospital.status}</span>
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{hospital.address}</p>
                  <p>{hospital.email}</p>
                  <p>{hospital.phone}</p>
                  <p><span className="font-medium">Admin:</span> {hospital.adminName}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{hospital.totalDoctors}</div>
                    <div className="text-xs text-gray-500">Doctors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{hospital.totalPatients}</div>
                    <div className="text-xs text-gray-500">Patients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{hospital.monthlyRecords}</div>
                    <div className="text-xs text-gray-500">Records/Month</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Registered: {new Date(hospital.registeredAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-green-600 hover:text-green-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    {hospital.status === 'pending' && (
                      <>
                        <Button size="sm" variant="success">
                          Approve
                        </Button>
                        <Button size="sm" variant="danger">
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pending Approvals - Show if there are pending hospitals */}
        {pendingHospitals > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                <p className="text-sm text-gray-600">
                  {pendingHospitals} hospital{pendingHospitals !== 1 ? 's' : ''} waiting for approval
                </p>
              </div>
              <Button variant="primary">
                Review Pending
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
