'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Filter,
  Search,
  Calendar,
  User,
  Building2,
  Activity,
  Brain
} from 'lucide-react';

const mockRecords = [
  {
    id: '1',
    title: 'Blood Test Results',
    description: 'Complete blood count and metabolic panel',
    recordType: 'lab_result',
    date: '2025-01-15',
    doctorName: 'Dr. Sarah Johnson',
    hospitalName: 'City Medical Center',
    files: [
      { name: 'blood_test_report.pdf', type: 'application/pdf', size: '245 KB' }
    ],
    aiSummary: 'Blood test shows normal glucose levels, slightly elevated cholesterol. Recommend dietary adjustments.',
    isPublic: false,
    blockchainHash: '0x1234...5678'
  },
  {
    id: '2',
    title: 'Chest X-Ray',
    description: 'Routine chest examination',
    recordType: 'imaging',
    date: '2025-01-10',
    doctorName: 'Dr. Michael Chen',
    hospitalName: 'General Hospital',
    files: [
      { name: 'chest_xray.jpg', type: 'image/jpeg', size: '1.2 MB' }
    ],
    aiSummary: 'Chest X-ray appears normal. No signs of infection or abnormalities detected.',
    isPublic: true,
    blockchainHash: '0x5678...9012'
  },
  {
    id: '3',
    title: 'Cardiology Consultation',
    description: 'Follow-up for heart palpitations',
    recordType: 'consultation',
    date: '2025-01-05',
    doctorName: 'Dr. Emily Roberts',
    hospitalName: 'Heart Care Institute',
    files: [
      { name: 'consultation_notes.pdf', type: 'application/pdf', size: '189 KB' },
      { name: 'ecg_results.pdf', type: 'application/pdf', size: '356 KB' }
    ],
    aiSummary: 'ECG shows normal sinus rhythm. Palpitations likely stress-related. Recommend stress management techniques.',
    isPublic: false,
    blockchainHash: '0x9012...3456'
  }
];

const recordTypeColors = {
  consultation: 'bg-blue-100 text-blue-800',
  lab_result: 'bg-green-100 text-green-800',
  prescription: 'bg-purple-100 text-purple-800',
  imaging: 'bg-orange-100 text-orange-800',
  surgery: 'bg-red-100 text-red-800',
  emergency: 'bg-yellow-100 text-yellow-800'
};

function PatientRecordsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const filteredRecords = mockRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || record.recordType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Health Records</h1>
        <p className="text-gray-600">View and manage your medical records securely stored on the blockchain.</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultations</option>
              <option value="lab_result">Lab Results</option>
              <option value="imaging">Imaging</option>
              <option value="prescription">Prescriptions</option>
              <option value="surgery">Surgery</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Records Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${recordTypeColors[record.recordType as keyof typeof recordTypeColors]}`}>
                      {record.recordType.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{record.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(record.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{record.doctorName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>{record.hospitalName}</span>
                </div>
              </div>

              {record.aiSummary && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">AI Summary</span>
                  </div>
                  <p className="text-sm text-blue-800">{record.aiSummary}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-1">
                  <Activity className={`w-4 h-4 ${record.isPublic ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-xs text-gray-600">
                    {record.isPublic ? 'Shared' : 'Private'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedRecord(record)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </Card>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selectedRecord.title}</h2>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRecord.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Date</h3>
                    <p className="text-gray-600">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Type</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${recordTypeColors[selectedRecord.recordType as keyof typeof recordTypeColors]}`}>
                      {selectedRecord.recordType.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Doctor</h3>
                    <p className="text-gray-600">{selectedRecord.doctorName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Hospital</h3>
                    <p className="text-gray-600">{selectedRecord.hospitalName}</p>
                  </div>
                </div>

                {selectedRecord.aiSummary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800">{selectedRecord.aiSummary}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Files</h3>
                  <div className="space-y-2">
                    {selectedRecord.files.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Blockchain</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Hash: {selectedRecord.blockchainHash}</p>
                    <p className="text-sm text-gray-600 mt-1">Status: Verified on Polygon</p>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4 border-t">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Download All Files
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Share Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientRecordsPage() {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <PatientRecordsContent />
    </ProtectedRoute>
  );
}
