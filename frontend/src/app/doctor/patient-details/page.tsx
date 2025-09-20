'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Search, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  FileText,
  Clock,
  Eye,
  Filter,
  Download,
  Share2,
  Activity
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  lastVisit: string;
  totalRecords: number;
  recentRecords: {
    id: string;
    type: string;
    date: string;
    description: string;
  }[];
  medicalHistory: string[];
  allergies: string[];
  bloodType: string;
  hasAccess: boolean;
}

export default function PatientDetailsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock data - in real app, get from URL params or API
  const patient: Patient = {
    id: 'P001234',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    dateOfBirth: '1985-03-15',
    gender: 'Female',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: {
      name: 'John Johnson',
      phone: '+1-555-0124',
      relation: 'Spouse'
    },
    lastVisit: '2024-07-15T14:30:00Z',
    totalRecords: 15,
    recentRecords: [
      {
        id: 'R001',
        type: 'Blood Test',
        date: '2024-07-15',
        description: 'Complete Blood Count (CBC) - Normal ranges'
      },
      {
        id: 'R002',
        type: 'X-Ray',
        date: '2024-07-10',
        description: 'Chest X-Ray - Clear lungs, no abnormalities'
      },
      {
        id: 'R003',
        type: 'Prescription',
        date: '2024-07-08',
        description: 'Antibiotic course for throat infection'
      },
      {
        id: 'R004',
        type: 'Consultation',
        date: '2024-06-20',
        description: 'Regular checkup - Overall health good'
      }
    ],
    medicalHistory: [
      'Hypertension (controlled)',
      'Seasonal allergies',
      'Previous appendectomy (2010)'
    ],
    allergies: ['Penicillin', 'Shellfish'],
    bloodType: 'A+',
    hasAccess: true
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

  const getRecordTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'blood test':
        return 'bg-red-100 text-red-800';
      case 'x-ray':
        return 'bg-blue-100 text-blue-800';
      case 'prescription':
        return 'bg-green-100 text-green-800';
      case 'consultation':
        return 'bg-purple-100 text-purple-800';
      case 'mri':
        return 'bg-indigo-100 text-indigo-800';
      case 'ct scan':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!patient.hasAccess) {
    return (
      <ProtectedRoute allowedRoles={['doctor']}>
        <div className="flex items-center justify-center min-h-96">
          <Card className="text-center max-w-md">
            <div className="p-6">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Required</h3>
              <p className="text-gray-500 mb-4">
                You need patient permission to view their medical records. Please request access first.
              </p>
              <Button variant="primary">
                Request Access
              </Button>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="space-y-6">
        <PageHeader
          title="Patient Details"
          description={`Medical records and information for ${patient.name}`}
        >
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="primary">
              <FileText className="w-4 h-4 mr-2" />
              New Record
            </Button>
          </div>
        </PageHeader>

        {/* Patient Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card title="Patient Information">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{calculateAge(patient.dateOfBirth)} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{patient.gender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Blood Type:</span>
                  <span className="font-medium">{patient.bloodType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Visit:</span>
                  <span className="font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{patient.address}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card title="Emergency Contact">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{patient.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relationship</p>
                <p className="font-medium">{patient.emergencyContact.relation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{patient.emergencyContact.phone}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Medical Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medical History */}
          <Card title="Medical History">
            <div className="space-y-2">
              {patient.medicalHistory.length > 0 ? (
                patient.medicalHistory.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{condition}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No significant medical history recorded</p>
              )}
            </div>
          </Card>

          {/* Allergies */}
          <Card title="Known Allergies">
            <div className="space-y-2">
              {patient.allergies.length > 0 ? (
                patient.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{allergy}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No known allergies</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Medical Records */}
        <Card title="Recent Medical Records">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                {patient.totalRecords} total records
              </div>
            </div>
            
            <div className="space-y-3">
              {patient.recentRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecordTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700">{record.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-4">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                View All Records ({patient.totalRecords})
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="primary" className="flex flex-col items-center p-4 h-20">
              <FileText className="w-6 h-6 mb-1" />
              <span className="text-sm">Add Record</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-20">
              <Calendar className="w-6 h-6 mb-1" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-20">
              <Share2 className="w-6 h-6 mb-1" />
              <span className="text-sm">Share Records</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-20">
              <Download className="w-6 h-6 mb-1" />
              <span className="text-sm">Export Data</span>
            </Button>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
