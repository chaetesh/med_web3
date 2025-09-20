'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Upload, 
  FileText, 
  User, 
  Search, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Eye,
  Download,
  Heart,
  Activity,
  Stethoscope,
  Camera,
  FileImage,
  FilePlus,
  Save
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  medicalNumber: string;
  lastVisit: string;
  allergies: string[];
  chronicConditions: string[];
}

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'consultation' | 'lab-report' | 'imaging' | 'prescription' | 'surgery' | 'discharge';
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  followUpDate?: string;
  files: {
    name: string;
    type: string;
    size: string;
    url: string;
  }[];
  status: 'draft' | 'completed' | 'reviewed';
}

export default function DoctorRecordsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recordType, setRecordType] = useState('consultation');
  const [recordTitle, setRecordTitle] = useState('');
  const [description, setDescription] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [medications, setMedications] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  // Mock data
  const patients: Patient[] = [
    {
      id: 'P001',
      name: 'Sarah Johnson',
      age: 39,
      gender: 'female',
      phone: '+1-555-0123',
      email: 'sarah.johnson@email.com',
      medicalNumber: 'MED-2023-001',
      lastVisit: '2024-07-18',
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension']
    },
    {
      id: 'P002',
      name: 'Robert Martinez',
      age: 51,
      gender: 'male',
      phone: '+1-555-0125',
      email: 'robert.martinez@email.com',
      medicalNumber: 'MED-2023-002',
      lastVisit: '2024-07-20',
      allergies: ['Latex'],
      chronicConditions: ['Diabetes Type 2', 'High Cholesterol']
    },
    {
      id: 'P003',
      name: 'Emily Chen',
      age: 33,
      gender: 'female',
      phone: '+1-555-0127',
      email: 'emily.chen@email.com',
      medicalNumber: 'MED-2023-003',
      lastVisit: '2024-07-15',
      allergies: [],
      chronicConditions: []
    }
  ];

  const recentRecords: MedicalRecord[] = [
    {
      id: 'R001',
      patientId: 'P001',
      patientName: 'Sarah Johnson',
      date: '2024-07-20',
      type: 'consultation',
      title: 'Cardiology Consultation',
      description: 'Patient presented with chest pain and shortness of breath',
      diagnosis: 'Angina pectoris, stable',
      treatment: 'Prescribed nitroglycerin, recommended lifestyle changes',
      medications: ['Nitroglycerin 0.4mg sublingual', 'Atorvastatin 20mg daily'],
      followUpDate: '2024-08-20',
      files: [
        { name: 'ECG_Report.pdf', type: 'pdf', size: '2.1 MB', url: '#' },
        { name: 'Blood_Test.pdf', type: 'pdf', size: '1.8 MB', url: '#' }
      ],
      status: 'completed'
    },
    {
      id: 'R002',
      patientId: 'P002',
      patientName: 'Robert Martinez',
      date: '2024-07-19',
      type: 'lab-report',
      title: 'Diabetes Management Lab Results',
      description: 'Quarterly diabetes monitoring lab work',
      diagnosis: 'Type 2 Diabetes Mellitus, well controlled',
      treatment: 'Continue current medication regimen',
      medications: ['Metformin 1000mg twice daily', 'Glipizide 5mg daily'],
      files: [
        { name: 'HbA1c_Results.pdf', type: 'pdf', size: '1.2 MB', url: '#' }
      ],
      status: 'completed'
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowUploadModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRecord = () => {
    if (!selectedPatient) return;

    const newRecord: MedicalRecord = {
      id: `R${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date: new Date().toISOString().split('T')[0],
      type: recordType as any,
      title: recordTitle,
      description,
      diagnosis,
      treatment,
      medications: medications.split('\n').filter(med => med.trim()),
      followUpDate: followUpDate || undefined,
      files: uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: '#'
      })),
      status: 'completed'
    };

    console.log('Submitting record:', newRecord);
    
    // Reset form
    setRecordTitle('');
    setDescription('');
    setDiagnosis('');
    setTreatment('');
    setMedications('');
    setFollowUpDate('');
    setUploadedFiles([]);
    setShowUploadModal(false);
    setSelectedPatient(null);
    
    alert('Medical record uploaded successfully!');
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-4 h-4" />;
      case 'lab-report':
        return <Activity className="w-4 h-4" />;
      case 'imaging':
        return <FileImage className="w-4 h-4" />;
      case 'prescription':
        return <Heart className="w-4 h-4" />;
      case 'surgery':
        return <FileText className="w-4 h-4" />;
      case 'discharge':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'lab-report':
        return 'bg-green-100 text-green-800';
      case 'imaging':
        return 'bg-purple-100 text-purple-800';
      case 'prescription':
        return 'bg-orange-100 text-orange-800';
      case 'surgery':
        return 'bg-red-100 text-red-800';
      case 'discharge':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRecords = recentRecords.length;
  const todayRecords = recentRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length;
  const pendingRecords = recentRecords.filter(r => r.status === 'draft').length;

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="space-y-6">
        <PageHeader
          title="Medical Records"
          description="Upload and manage patient medical records"
        >
          <Button variant="primary" onClick={() => setActiveTab('upload')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload New Record
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Records"
            value={totalRecords.toString()}
            change={{ value: "All time uploads", trend: "neutral" }}
            icon={<FileText className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Today's Records"
            value={todayRecords.toString()}
            change={{ value: "Uploaded today", trend: "up" }}
            icon={<Clock className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Pending Review"
            value={pendingRecords.toString()}
            change={{ value: "Awaiting review", trend: "neutral" }}
            icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
          />
          <StatCard
            title="My Patients"
            value={patients.length.toString()}
            change={{ value: "Under your care", trend: "neutral" }}
            icon={<User className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Record
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Recent Records ({recentRecords.length})
            </button>
          </nav>
        </div>

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Patient Search */}
            <Card title="Select Patient">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search patients by name or medical number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">
                          {patient.age} years • {patient.gender} • {patient.medicalNumber}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </p>
                        {patient.allergies.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-red-600 font-medium">Allergies: </span>
                            <span className="text-xs text-red-600">{patient.allergies.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                  <p className="text-gray-500">No patients match your search criteria.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <Card title="Recent Medical Records">
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {getRecordTypeIcon(record.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{record.title}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRecordTypeColor(record.type)}`}>
                              {record.type.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Patient: {record.patientName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString()} • Status: {record.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:text-green-800">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Diagnosis:</span>
                          <p className="text-gray-600">{record.diagnosis}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Treatment:</span>
                          <p className="text-gray-600">{record.treatment}</p>
                        </div>
                      </div>
                    </div>

                    {record.medications.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Medications:</span>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {record.medications.map((med, index) => (
                            <li key={index}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {record.files.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Attached Files:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {record.files.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">({file.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.followUpDate && (
                      <div className="text-sm text-blue-600">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Follow-up scheduled: {new Date(record.followUpDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {recentRecords.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
                  <p className="text-gray-500">You haven't uploaded any medical records yet.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && selectedPatient && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upload Medical Record</h3>
                  <button 
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Patient: {selectedPatient.name}</h4>
                  <p className="text-sm text-gray-600">
                    {selectedPatient.age} years • {selectedPatient.gender} • {selectedPatient.medicalNumber}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Record Type
                      </label>
                      <select
                        value={recordType}
                        onChange={(e) => setRecordType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="consultation">Consultation</option>
                        <option value="lab-report">Lab Report</option>
                        <option value="imaging">Imaging</option>
                        <option value="prescription">Prescription</option>
                        <option value="surgery">Surgery Report</option>
                        <option value="discharge">Discharge Summary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Record Title
                    </label>
                    <input
                      type="text"
                      value={recordTitle}
                      onChange={(e) => setRecordTitle(e.target.value)}
                      placeholder="Enter record title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Describe the patient's condition and reason for visit..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis
                    </label>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={2}
                      placeholder="Enter diagnosis..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treatment Plan
                    </label>
                    <textarea
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      rows={2}
                      placeholder="Enter treatment plan..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medications (one per line)
                    </label>
                    <textarea
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      rows={3}
                      placeholder="Enter medications, one per line..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Files
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drop files here or click to upload
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </label>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSubmitRecord}
                    disabled={!recordTitle.trim() || !description.trim() || !diagnosis.trim()}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Record
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
