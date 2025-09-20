'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin,
  Heart,
  AlertTriangle,
  FileText,
  Eye,
  Edit,
  Plus,
  Clock,
  Building,
  Activity,
  Shield,
  QrCode
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  address: string;
  medicalNumber: string;
  lastVisit: string;
  nextAppointment?: string;
  status: 'active' | 'inactive' | 'critical';
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: string;
  visitCount: number;
  recordsCount: number;
}

export default function DoctorSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Mock data - replace with actual API calls
  const patients: Patient[] = [
    {
      id: 'P001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      dateOfBirth: '1985-03-15',
      age: 39,
      gender: 'female',
      bloodType: 'A+',
      address: '123 Oak Street, City, State 12345',
      medicalNumber: 'MED-2023-001',
      lastVisit: '2024-07-18',
      nextAppointment: '2024-07-25T10:00:00Z',
      status: 'active',
      allergies: ['Penicillin', 'Shellfish'],
      chronicConditions: ['Hypertension'],
      emergencyContact: {
        name: 'Mike Johnson',
        phone: '+1-555-0124',
        relationship: 'Spouse'
      },
      insurance: 'BlueCross BlueShield',
      visitCount: 12,
      recordsCount: 24
    },
    {
      id: 'P002',
      name: 'Robert Martinez',
      email: 'robert.martinez@email.com',
      phone: '+1-555-0125',
      dateOfBirth: '1972-08-22',
      age: 51,
      gender: 'male',
      bloodType: 'O-',
      address: '456 Pine Avenue, City, State 12345',
      medicalNumber: 'MED-2023-002',
      lastVisit: '2024-07-20',
      status: 'critical',
      allergies: ['Latex'],
      chronicConditions: ['Diabetes Type 2', 'High Cholesterol'],
      emergencyContact: {
        name: 'Maria Martinez',
        phone: '+1-555-0126',
        relationship: 'Wife'
      },
      insurance: 'Aetna',
      visitCount: 28,
      recordsCount: 45
    },
    {
      id: 'P003',
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+1-555-0127',
      dateOfBirth: '1990-12-05',
      age: 33,
      gender: 'female',
      bloodType: 'B+',
      address: '789 Maple Drive, City, State 12345',
      medicalNumber: 'MED-2023-003',
      lastVisit: '2024-07-15',
      nextAppointment: '2024-07-28T14:30:00Z',
      status: 'active',
      allergies: [],
      chronicConditions: [],
      emergencyContact: {
        name: 'David Chen',
        phone: '+1-555-0128',
        relationship: 'Brother'
      },
      insurance: 'United Healthcare',
      visitCount: 6,
      recordsCount: 11
    },
    {
      id: 'P004',
      name: 'Michael Thompson',
      email: 'michael.thompson@email.com',
      phone: '+1-555-0129',
      dateOfBirth: '1965-06-18',
      age: 59,
      gender: 'male',
      bloodType: 'AB+',
      address: '321 Cedar Lane, City, State 12345',
      medicalNumber: 'MED-2023-004',
      lastVisit: '2024-06-30',
      status: 'inactive',
      allergies: ['Aspirin'],
      chronicConditions: ['Arthritis'],
      emergencyContact: {
        name: 'Linda Thompson',
        phone: '+1-555-0130',
        relationship: 'Wife'
      },
      insurance: 'Medicare',
      visitCount: 15,
      recordsCount: 32
    }
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
                         patient.medicalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    const matchesAge = ageFilter === 'all' || 
                      (ageFilter === 'child' && patient.age < 18) ||
                      (ageFilter === 'adult' && patient.age >= 18 && patient.age < 65) ||
                      (ageFilter === 'senior' && patient.age >= 65);
    
    return matchesSearch && matchesStatus && matchesAge;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'age':
        return a.age - b.age;
      case 'lastVisit':
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const criticalPatients = patients.filter(p => p.status === 'critical').length;
  const todaysAppointments = patients.filter(p => 
    p.nextAppointment && new Date(p.nextAppointment).toDateString() === new Date().toDateString()
  ).length;

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="space-y-6">
        <PageHeader
          title="Patient Search"
          description="Search and manage your patients"
        >
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={totalPatients.toString()}
            change={{ value: "Under your care", trend: "neutral" }}
            icon={<User className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Active Patients"
            value={activePatients.toString()}
            change={{ value: `${Math.round((activePatients / totalPatients) * 100)}% of total`, trend: "up" }}
            icon={<Activity className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Critical Cases"
            value={criticalPatients.toString()}
            change={{ value: "Require attention", trend: "down" }}
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          />
          <StatCard
            title="Today's Appointments"
            value={todaysAppointments.toString()}
            change={{ value: "Scheduled for today", trend: "neutral" }}
            icon={<Calendar className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients by name, email, or medical number..."
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
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Ages</option>
              <option value="child">Child (&lt; 18)</option>
              <option value="adult">Adult (18-64)</option>
              <option value="senior">Senior (65+)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="age">Sort by Age</option>
              <option value="lastVisit">Sort by Last Visit</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </Card>

        {/* Patient List */}
        <Card title={`Patients (${sortedPatients.length} found)`}>
          <div className="space-y-4">
            {sortedPatients.map((patient) => (
              <div 
                key={patient.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {patient.age} years • {patient.gender} • {patient.medicalNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {getStatusIcon(patient.status)}
                      <span className="ml-1 capitalize">{patient.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    <span>Blood Type: {patient.bloodType}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                  </div>
                </div>

                {patient.nextAppointment && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-sm text-blue-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Next Appointment: {new Date(patient.nextAppointment).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {patient.allergies.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700 mr-2">Allergies:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, index) => (
                        <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>{patient.visitCount} visits</span>
                    <span>{patient.recordsCount} records</span>
                    <span>{patient.insurance}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-green-600 hover:text-green-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-purple-600 hover:text-purple-800">
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedPatients.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500">No patients match your current search criteria.</p>
            </div>
          )}
        </Card>

        {/* Patient Details Modal */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Details</h3>
                  <button 
                    onClick={() => setShowPatientModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium">{selectedPatient.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <span className="ml-2 font-medium">{selectedPatient.age} years</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <span className="ml-2 font-medium capitalize">{selectedPatient.gender}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Blood Type:</span>
                        <span className="ml-2 font-medium">{selectedPatient.bloodType}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Address:</span>
                        <span className="ml-2 font-medium">{selectedPatient.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium">{selectedPatient.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-2 font-medium">{selectedPatient.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
                    <div className="text-sm">
                      <div className="mb-1">
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium">{selectedPatient.emergencyContact.name}</span>
                      </div>
                      <div className="mb-1">
                        <span className="text-gray-500">Relationship:</span>
                        <span className="ml-2 font-medium">{selectedPatient.emergencyContact.relationship}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-2 font-medium">{selectedPatient.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Medical Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Allergies:</span>
                        <div className="mt-1">
                          {selectedPatient.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedPatient.allergies.map((allergy, index) => (
                                <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600">None</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Chronic Conditions:</span>
                        <div className="mt-1">
                          {selectedPatient.chronicConditions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedPatient.chronicConditions.map((condition, index) => (
                                <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                  {condition}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowPatientModal(false)} className="flex-1">
                    Close
                  </Button>
                  <Button variant="primary" className="flex-1">
                    View Full Records
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
