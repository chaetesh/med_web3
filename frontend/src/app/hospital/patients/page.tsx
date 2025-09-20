'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  FileText,
  Heart,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  bloodType: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  registrationDate: string;
  lastVisit: string;
  totalVisits: number;
  recordsCount: number;
  status: 'active' | 'inactive' | 'critical';
  primaryDoctor: string;
  insuranceProvider: string;
  medicalNumber: string;
}

export default function HospitalPatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data - replace with actual API calls
  const patients: Patient[] = [
    {
      id: 'PT001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      dateOfBirth: '1985-03-15',
      gender: 'male',
      address: '123 Main St, City, State 12345',
      bloodType: 'A+',
      allergies: ['Penicillin', 'Nuts'],
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'Spouse',
        phone: '+1-555-0102'
      },
      registrationDate: '2023-01-15',
      lastVisit: '2024-07-18',
      totalVisits: 12,
      recordsCount: 24,
      status: 'active',
      primaryDoctor: 'Dr. Sarah Chen',
      insuranceProvider: 'BlueCross',
      medicalNumber: 'MED-2023-001'
    },
    {
      id: 'PT002',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '+1-555-0103',
      dateOfBirth: '1978-09-22',
      gender: 'female',
      address: '456 Oak Ave, City, State 12345',
      bloodType: 'O-',
      allergies: ['Latex'],
      emergencyContact: {
        name: 'Carlos Garcia',
        relationship: 'Husband',
        phone: '+1-555-0104'
      },
      registrationDate: '2022-11-20',
      lastVisit: '2024-07-20',
      totalVisits: 18,
      recordsCount: 31,
      status: 'critical',
      primaryDoctor: 'Dr. Michael Rodriguez',
      insuranceProvider: 'Aetna',
      medicalNumber: 'MED-2022-045'
    },
    {
      id: 'PT003',
      name: 'David Johnson',
      email: 'david.j@email.com',
      phone: '+1-555-0105',
      dateOfBirth: '1992-06-10',
      gender: 'male',
      address: '789 Pine St, City, State 12345',
      bloodType: 'B+',
      allergies: [],
      emergencyContact: {
        name: 'Susan Johnson',
        relationship: 'Mother',
        phone: '+1-555-0106'
      },
      registrationDate: '2023-05-08',
      lastVisit: '2024-06-15',
      totalVisits: 6,
      recordsCount: 12,
      status: 'inactive',
      primaryDoctor: 'Dr. Emily Park',
      insuranceProvider: 'United Health',
      medicalNumber: 'MED-2023-078'
    },
    {
      id: 'PT004',
      name: 'Lisa Wilson',
      email: 'lisa.wilson@email.com',
      phone: '+1-555-0107',
      dateOfBirth: '1965-12-03',
      gender: 'female',
      address: '321 Elm Dr, City, State 12345',
      bloodType: 'AB-',
      allergies: ['Shellfish', 'Aspirin'],
      emergencyContact: {
        name: 'Robert Wilson',
        relationship: 'Spouse',
        phone: '+1-555-0108'
      },
      registrationDate: '2021-08-14',
      lastVisit: '2024-07-19',
      totalVisits: 28,
      recordsCount: 47,
      status: 'active',
      primaryDoctor: 'Dr. James Wilson',
      insuranceProvider: 'Kaiser',
      medicalNumber: 'MED-2021-123'
    }
  ];

  const doctors = [
    'Dr. Sarah Chen',
    'Dr. Michael Rodriguez',
    'Dr. Emily Park',
    'Dr. James Wilson',
    'Dr. Lisa Thompson',
    'Dr. Mark Davis'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.medicalNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesDoctor = doctorFilter === 'all' || patient.primaryDoctor === doctorFilter;
    
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const criticalPatients = patients.filter(p => p.status === 'critical').length;
  const totalRecords = patients.reduce((sum, p) => sum + p.recordsCount, 0);

  return (
    <ProtectedRoute allowedRoles={['hospital_admin']}>
      <div className="space-y-6">
        <PageHeader
          title="Patient Management"
          description="Manage patient records and information"
        >
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Register Patient
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={totalPatients.toString()}
            change={{ value: "+12 this month", trend: "up" }}
            icon={<Users className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Active Patients"
            value={activePatients.toString()}
            change={{ value: `${Math.round((activePatients / totalPatients) * 100)}% active`, trend: "up" }}
            icon={<Activity className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Critical Cases"
            value={criticalPatients.toString()}
            change={{ value: "Requires attention", trend: "down" }}
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          />
          <StatCard
            title="Total Records"
            value={totalRecords.toString()}
            change={{ value: "All patients combined", trend: "neutral" }}
            icon={<FileText className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor} value={doctor}>{doctor}</option>
              ))}
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>
        </Card>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {calculateAge(patient.dateOfBirth)} years • {patient.gender}
                      </p>
                      <p className="text-xs text-gray-400">{patient.medicalNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {getStatusIcon(patient.status)}
                      <span className="ml-1 capitalize">{patient.status}</span>
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{patient.address}</span>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-gray-600">Blood Type:</span>
                    </div>
                    <span className="font-medium text-red-600">{patient.bloodType}</span>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <Shield className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
                      <span className="text-gray-600">Allergies:</span>
                    </div>
                    <div className="text-right">
                      {patient.allergies.length > 0 ? (
                        <div className="space-y-1">
                          {patient.allergies.map((allergy, index) => (
                            <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mr-1">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-green-600 text-xs">None</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Primary Doctor:</span>
                    <span className="font-medium text-blue-600">{patient.primaryDoctor}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Insurance:</span>
                    <span className="font-medium">{patient.insuranceProvider}</span>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</div>
                    <div className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {patient.emergencyContact.phone}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{patient.totalVisits}</div>
                    <div className="text-xs text-gray-500">Visits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{patient.recordsCount}</div>
                    <div className="text-xs text-gray-500">Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Last Visit</div>
                    <div className="text-xs font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Registered: {new Date(patient.registrationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-green-600 hover:text-green-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-purple-600 hover:text-purple-800">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500">No patients match your current filters.</p>
          </Card>
        )}

        {/* Quick Stats by Status */}
        <Card title="Patient Status Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{activePatients}</div>
              <div className="text-sm text-green-700">Active Patients</div>
            </div>
            <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {patients.filter(p => p.status === 'inactive').length}
              </div>
              <div className="text-sm text-yellow-700">Inactive Patients</div>
            </div>
            <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{criticalPatients}</div>
              <div className="text-sm text-red-700">Critical Cases</div>
            </div>
          </div>
        </Card>

        {/* Add Patient Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Register New Patient</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john.smith@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1-555-0123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Doctor</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Primary Doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor} value={doctor}>{doctor}</option>
                      ))}
                    </select>
                  </div>
                </form>
                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1">
                    Register Patient
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
