'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  QrCode, 
  Download, 
  Share2, 
  Printer, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Smartphone,
  Computer,
  Shield,
  Clock,
  Eye,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface QRCodeData {
  id: string;
  patientId: string;
  type: 'full_access' | 'emergency_only' | 'specific_records';
  createdDate: string;
  expiryDate: string;
  accessLevel: string;
  recordsIncluded: string[];
  usageCount: number;
  maxUsage: number;
  status: 'active' | 'expired' | 'revoked';
  lastUsed?: string;
}

export default function PatientSharePage() {
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState('emergency_only');
  const [expiryDays, setExpiryDays] = useState(7);
  const [maxUsage, setMaxUsage] = useState(5);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<QRCodeData | null>(null);

  // Mock data - replace with actual API calls
  const availableRecords = [
    { id: 'rec1', title: 'Blood Test Results', date: '2024-07-15', type: 'Lab Report' },
    { id: 'rec2', title: 'X-Ray Chest', date: '2024-07-10', type: 'Imaging' },
    { id: 'rec3', title: 'Prescription - Antibiotics', date: '2024-07-08', type: 'Prescription' },
    { id: 'rec4', title: 'Annual Physical Exam', date: '2024-06-20', type: 'Examination' },
    { id: 'rec5', title: 'Vaccination Record', date: '2024-06-15', type: 'Immunization' },
    { id: 'rec6', title: 'Cardiology Consultation', date: '2024-06-01', type: 'Consultation' }
  ];

  const existingQRCodes: QRCodeData[] = [
    {
      id: 'qr1',
      patientId: 'patient123',
      type: 'emergency_only',
      createdDate: '2024-07-18',
      expiryDate: '2024-07-25',
      accessLevel: 'Emergency Access',
      recordsIncluded: ['Emergency Contact', 'Allergies', 'Blood Type', 'Current Medications'],
      usageCount: 2,
      maxUsage: 10,
      status: 'active',
      lastUsed: '2024-07-20T14:30:00Z'
    },
    {
      id: 'qr2',
      patientId: 'patient123',
      type: 'specific_records',
      createdDate: '2024-07-15',
      expiryDate: '2024-07-22',
      accessLevel: 'Specific Records',
      recordsIncluded: ['Blood Test Results', 'X-Ray Chest'],
      usageCount: 1,
      maxUsage: 3,
      status: 'active',
      lastUsed: '2024-07-16T09:15:00Z'
    },
    {
      id: 'qr3',
      patientId: 'patient123',
      type: 'full_access',
      createdDate: '2024-07-10',
      expiryDate: '2024-07-17',
      accessLevel: 'Full Access',
      recordsIncluded: ['All Medical Records'],
      usageCount: 5,
      maxUsage: 5,
      status: 'expired'
    }
  ];

  const handleRecordToggle = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const generateQRCode = () => {
    const newQR: QRCodeData = {
      id: `qr${Date.now()}`,
      patientId: 'patient123',
      type: accessLevel as any,
      createdDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      accessLevel: accessLevel === 'emergency_only' ? 'Emergency Access' : 
                   accessLevel === 'full_access' ? 'Full Access' : 'Specific Records',
      recordsIncluded: accessLevel === 'specific_records' 
        ? selectedRecords.map(id => availableRecords.find(r => r.id === id)?.title || '')
        : accessLevel === 'emergency_only' 
          ? ['Emergency Contact', 'Allergies', 'Blood Type', 'Current Medications']
          : ['All Medical Records'],
      usageCount: 0,
      maxUsage: maxUsage,
      status: 'active'
    };

    setGeneratedQR(newQR);
    setShowQRModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'revoked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'revoked':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  const activeQRs = existingQRCodes.filter(qr => qr.status === 'active').length;
  const totalUsages = existingQRCodes.reduce((sum, qr) => sum + qr.usageCount, 0);
  const expiringSoon = existingQRCodes.filter(qr => {
    const expiryDate = new Date(qr.expiryDate);
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return qr.status === 'active' && expiryDate <= threeDaysFromNow;
  }).length;

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="space-y-6">
        <PageHeader
          title="Share Medical Records"
          description="Generate secure QR codes to share your medical information with healthcare providers"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active QR Codes"
            value={activeQRs.toString()}
            change={{ value: "Currently active", trend: "neutral" }}
            icon={<QrCode className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Total Uses"
            value={totalUsages.toString()}
            change={{ value: "All time", trend: "up" }}
            icon={<Eye className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Expiring Soon"
            value={expiringSoon.toString()}
            change={{ value: "Within 3 days", trend: "down" }}
            icon={<Clock className="w-6 h-6 text-orange-600" />}
          />
          <StatCard
            title="Security Level"
            value="High"
            change={{ value: "256-bit encryption", trend: "neutral" }}
            icon={<Shield className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Generate New QR Code */}
        <Card title="Generate New QR Code">
          <div className="space-y-6">
            {/* Access Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Access Level</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    accessLevel === 'emergency_only' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setAccessLevel('emergency_only')}
                >
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-medium">Emergency Only</span>
                  </div>
                  <p className="text-sm text-gray-600">Basic emergency information: allergies, blood type, emergency contacts</p>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    accessLevel === 'specific_records' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setAccessLevel('specific_records')}
                >
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Specific Records</span>
                  </div>
                  <p className="text-sm text-gray-600">Share selected medical records for specific consultations</p>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    accessLevel === 'full_access' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setAccessLevel('full_access')}
                >
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium">Full Access</span>
                  </div>
                  <p className="text-sm text-gray-600">Complete medical history access for comprehensive care</p>
                </div>
              </div>
            </div>

            {/* Record Selection (only for specific records) */}
            {accessLevel === 'specific_records' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Records to Share ({selectedRecords.length} selected)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRecords.includes(record.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleRecordToggle(record.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{record.title}</div>
                          <div className="text-sm text-gray-500">{record.type} • {record.date}</div>
                        </div>
                        {selectedRecords.includes(record.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Duration
                </label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>1 Week</option>
                  <option value={14}>2 Weeks</option>
                  <option value={30}>1 Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Uses
                </label>
                <select
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 Use</option>
                  <option value={3}>3 Uses</option>
                  <option value={5}>5 Uses</option>
                  <option value={10}>10 Uses</option>
                  <option value={-1}>Unlimited</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                variant="primary" 
                onClick={generateQRCode}
                disabled={accessLevel === 'specific_records' && selectedRecords.length === 0}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </Button>
            </div>
          </div>
        </Card>

        {/* Existing QR Codes */}
        <Card title="Your Active QR Codes">
          <div className="space-y-4">
            {existingQRCodes.map((qr) => (
              <div key={qr.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <QrCode className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">{qr.accessLevel}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(qr.status)}`}>
                        {getStatusIcon(qr.status)}
                        <span className="ml-1 capitalize">{qr.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created: {new Date(qr.createdDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Expires: {new Date(qr.expiryDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        Used: {qr.usageCount}/{qr.maxUsage === -1 ? '∞' : qr.maxUsage}
                      </div>
                      {qr.lastUsed && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Last used: {new Date(qr.lastUsed).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Included Records:</div>
                      <div className="flex flex-wrap gap-1">
                        {qr.recordsIncluded.map((record, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {record}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button 
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      onClick={() => copyToClipboard(`QR-${qr.id}`)}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded">
                      <Download className="w-4 h-4" />
                    </button>
                    {qr.status === 'active' && (
                      <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded">
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {existingQRCodes.length === 0 && (
            <div className="text-center py-8">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No QR codes generated</h3>
              <p className="text-gray-500">Generate your first QR code to start sharing your medical records securely.</p>
            </div>
          )}
        </Card>

        {/* QR Code Modal */}
        {showQRModal && generatedQR && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="text-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code Generated Successfully</h3>
                  <p className="text-sm text-gray-600">Your secure medical data QR code is ready to use</p>
                </div>

                {/* QR Code Display */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                      <div className="text-xs text-gray-500">QR Code Preview</div>
                      <div className="text-xs font-mono text-gray-400 mt-1">{generatedQR.id}</div>
                    </div>
                  </div>
                </div>

                {/* QR Code Details */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Access Level:</span>
                    <span className="font-medium">{generatedQR.accessLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">{new Date(generatedQR.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Uses:</span>
                    <span className="font-medium">{generatedQR.maxUsage === -1 ? 'Unlimited' : generatedQR.maxUsage}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button variant="outline" className="text-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="text-sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="text-sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" className="text-sm" onClick={() => copyToClipboard(generatedQR.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy ID
                  </Button>
                </div>

                <Button variant="primary" onClick={() => setShowQRModal(false)} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <Card title="How to Use QR Codes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">For Healthcare Providers</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <Smartphone className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Scan QR code with MediChain mobile app or web scanner</span>
                </div>
                <div className="flex items-start">
                  <Shield className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>Authenticate using your verified healthcare provider credentials</span>
                </div>
                <div className="flex items-start">
                  <Eye className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
                  <span>Access patient records according to the permission level granted</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Security Features</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <Shield className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>End-to-end encryption with blockchain verification</span>
                </div>
                <div className="flex items-start">
                  <Clock className="w-4 h-4 mr-2 mt-0.5 text-orange-600" />
                  <span>Time-limited access with automatic expiration</span>
                </div>
                <div className="flex items-start">
                  <RefreshCw className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Real-time usage tracking and audit logs</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
