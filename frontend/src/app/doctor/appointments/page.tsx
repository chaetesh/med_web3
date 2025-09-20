'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Building,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Star,
  Heart,
  Stethoscope,
  Activity,
  CreditCard,
  FileText,
  Eye,
  Edit,
  MessageSquare,
  Video,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'in-progress';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine-checkup';
  symptoms: string;
  notes?: string;
  consultationFee: number;
  isFirstVisit: boolean;
  lastVisitDate?: string;
  allergies: string[];
  chronicConditions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  appointmentMode: 'in-person' | 'video-call' | 'phone-call';
  insuranceProvider?: string;
  referredBy?: string;
}

export default function DoctorAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'history'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Mock data - replace with actual API calls
  const appointments: Appointment[] = [
    {
      id: 'A001',
      patientId: 'P001',
      patientName: 'Sarah Johnson',
      patientAge: 39,
      patientGender: 'female',
      patientPhone: '+1-555-0123',
      patientEmail: 'sarah.johnson@email.com',
      date: '2024-07-24',
      time: '09:00',
      duration: 30,
      status: 'scheduled',
      type: 'consultation',
      symptoms: 'Chest pain, shortness of breath, fatigue',
      consultationFee: 200,
      isFirstVisit: false,
      lastVisitDate: '2024-06-15',
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension'],
      urgencyLevel: 'high',
      appointmentMode: 'in-person',
      insuranceProvider: 'BlueCross BlueShield',
      referredBy: 'Dr. Smith (Family Medicine)'
    },
    {
      id: 'A002',
      patientId: 'P002',
      patientName: 'Robert Martinez',
      patientAge: 51,
      patientGender: 'male',
      patientPhone: '+1-555-0125',
      patientEmail: 'robert.martinez@email.com',
      date: '2024-07-24',
      time: '10:30',
      duration: 45,
      status: 'scheduled',
      type: 'follow-up',
      symptoms: 'Diabetes management check-up',
      consultationFee: 150,
      isFirstVisit: false,
      lastVisitDate: '2024-07-10',
      allergies: ['Latex'],
      chronicConditions: ['Diabetes Type 2', 'High Cholesterol'],
      urgencyLevel: 'medium',
      appointmentMode: 'in-person',
      insuranceProvider: 'Aetna'
    },
    {
      id: 'A003',
      patientId: 'P003',
      patientName: 'Emily Chen',
      patientAge: 33,
      patientGender: 'female',
      patientPhone: '+1-555-0127',
      patientEmail: 'emily.chen@email.com',
      date: '2024-07-24',
      time: '14:00',
      duration: 30,
      status: 'scheduled',
      type: 'consultation',
      symptoms: 'Annual physical examination',
      consultationFee: 200,
      isFirstVisit: true,
      allergies: [],
      chronicConditions: [],
      urgencyLevel: 'low',
      appointmentMode: 'in-person',
      insuranceProvider: 'United Healthcare'
    },
    {
      id: 'A004',
      patientId: 'P004',
      patientName: 'Michael Thompson',
      patientAge: 59,
      patientGender: 'male',
      patientPhone: '+1-555-0129',
      patientEmail: 'michael.thompson@email.com',
      date: '2024-07-24',
      time: '15:30',
      duration: 30,
      status: 'completed',
      type: 'consultation',
      symptoms: 'Joint pain, arthritis symptoms',
      notes: 'Prescribed anti-inflammatory medication. Recommended physical therapy. Follow-up in 4 weeks.',
      consultationFee: 200,
      isFirstVisit: false,
      lastVisitDate: '2024-05-20',
      allergies: ['Aspirin'],
      chronicConditions: ['Arthritis'],
      urgencyLevel: 'medium',
      appointmentMode: 'in-person',
      insuranceProvider: 'Medicare'
    },
    {
      id: 'A005',
      patientId: 'P005',
      patientName: 'Lisa Wang',
      patientAge: 28,
      patientGender: 'female',
      patientPhone: '+1-555-0131',
      patientEmail: 'lisa.wang@email.com',
      date: '2024-07-25',
      time: '09:30',
      duration: 30,
      status: 'scheduled',
      type: 'consultation',
      symptoms: 'Headaches, sleep issues',
      consultationFee: 200,
      isFirstVisit: true,
      allergies: [],
      chronicConditions: [],
      urgencyLevel: 'medium',
      appointmentMode: 'video-call',
      insuranceProvider: 'Kaiser Permanente'
    },
    {
      id: 'A006',
      patientId: 'P006',
      patientName: 'David Rodriguez',
      patientAge: 45,
      patientGender: 'male',
      patientPhone: '+1-555-0133',
      patientEmail: 'david.rodriguez@email.com',
      date: '2024-07-23',
      time: '11:00',
      duration: 30,
      status: 'no-show',
      type: 'follow-up',
      symptoms: 'Blood pressure monitoring',
      consultationFee: 150,
      isFirstVisit: false,
      lastVisitDate: '2024-06-23',
      allergies: [],
      chronicConditions: ['Hypertension'],
      urgencyLevel: 'medium',
      appointmentMode: 'in-person',
      insuranceProvider: 'Humana'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'no-show':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'in-progress':
        return <Activity className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentModeIcon = (mode: string) => {
    switch (mode) {
      case 'video-call':
        return <Video className="w-4 h-4" />;
      case 'phone-call':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <Building className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(apt => new Date(apt.date).toDateString() === today);
  const upcomingAppointments = appointments.filter(apt => new Date(apt.date) > new Date() && new Date(apt.date).toDateString() !== today);
  const historyAppointments = appointments.filter(apt => new Date(apt.date) < new Date() || apt.status === 'completed' || apt.status === 'no-show');

  const getCurrentAppointments = () => {
    switch (activeTab) {
      case 'today':
        return todayAppointments;
      case 'upcoming':
        return upcomingAppointments;
      case 'history':
        return historyAppointments;
      default:
        return todayAppointments;
    }
  };

  const filteredAppointments = getCurrentAppointments().filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAppointments = appointments.length;
  const todayCount = todayAppointments.length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const revenue = appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.consultationFee, 0);

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleAddNotes = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentNotes(appointment.notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    // Here you would typically make an API call to save the notes
    console.log('Saving notes for appointment:', selectedAppointment?.id, appointmentNotes);
    setShowNotesModal(false);
    setSelectedAppointment(null);
    setAppointmentNotes('');
  };

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    // Here you would typically make an API call to update the status
    console.log('Updating appointment status:', appointmentId, newStatus);
  };

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="space-y-6">
        <PageHeader
          title="My Appointments"
          description="Manage your scheduled appointments and patient visits"
        >
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Appointments"
            value={totalAppointments.toString()}
            change={{ value: "All time", trend: "neutral" }}
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Today's Appointments"
            value={todayCount.toString()}
            change={{ value: "Scheduled for today", trend: "up" }}
            icon={<Clock className="w-6 h-6 text-orange-600" />}
          />
          <StatCard
            title="Completed"
            value={completedCount.toString()}
            change={{ value: `${Math.round((completedCount / totalAppointments) * 100)}% completion rate`, trend: "up" }}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Revenue"
            value={`$${revenue.toLocaleString()}`}
            change={{ value: "From completed visits", trend: "up" }}
            icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('today')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'today'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Today ({todayCount})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Upcoming ({upcomingAppointments.length})
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
              History ({historyAppointments.length})
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients or symptoms..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
              <option value="in-progress">In Progress</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="routine-checkup">Routine Checkup</option>
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </Card>

        {/* Appointments List */}
        <Card title={`Appointments (${filteredAppointments.length} found)`}>
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                        {appointment.isFirstVisit && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            First Visit
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(appointment.urgencyLevel)}`}>
                          {appointment.urgencyLevel.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {appointment.patientAge} years • {appointment.patientGender} • {appointment.patientPhone}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{appointment.time} ({appointment.duration} min)</span>
                        </div>
                        <div className="flex items-center">
                          {getAppointmentModeIcon(appointment.appointmentMode)}
                          <span className="ml-1 capitalize">{appointment.appointmentMode.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1 capitalize">{appointment.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">Symptoms:</span>
                    <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2 capitalize">{appointment.type.replace('-', ' ')}</span>
                    </div>
                    <div>
                      <span className="font-medium">Fee:</span>
                      <span className="ml-2 text-green-600 font-medium">${appointment.consultationFee}</span>
                    </div>
                  </div>
                </div>

                {appointment.allergies.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700 mr-2">Allergies:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {appointment.allergies.map((allergy, index) => (
                        <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {appointment.chronicConditions.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700 mr-2">Chronic Conditions:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {appointment.chronicConditions.map((condition, index) => (
                        <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {appointment.notes && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>{appointment.insuranceProvider}</span>
                    {appointment.referredBy && <span>Referred by: {appointment.referredBy}</span>}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAppointmentSelect(appointment)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleAddNotes(appointment)}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Add Notes"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {appointment.appointmentMode === 'video-call' && appointment.status === 'scheduled' && (
                      <button className="p-1 text-purple-600 hover:text-purple-800" title="Start Video Call">
                        <Video className="w-4 h-4" />
                      </button>
                    )}
                    {appointment.status === 'scheduled' && (
                      <select
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="" disabled>Update Status</option>
                        <option value="in-progress">Start Appointment</option>
                        <option value="completed">Mark Complete</option>
                        <option value="no-show">Mark No Show</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">No appointments match your current search criteria.</p>
            </div>
          )}
        </Card>

        {/* Appointment Details Modal */}
        {showAppointmentModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                  <button 
                    onClick={() => setShowAppointmentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Patient Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Patient Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium">{selectedAppointment.patientName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <span className="ml-2 font-medium">{selectedAppointment.patientAge} years</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <span className="ml-2 font-medium capitalize">{selectedAppointment.patientGender}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-2 font-medium">{selectedAppointment.patientPhone}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium">{selectedAppointment.patientEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Appointment Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="ml-2 font-medium">{new Date(selectedAppointment.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <span className="ml-2 font-medium">{selectedAppointment.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium">{selectedAppointment.duration} minutes</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Mode:</span>
                        <span className="ml-2 font-medium capitalize">{selectedAppointment.appointmentMode.replace('-', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 font-medium capitalize">{selectedAppointment.type.replace('-', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fee:</span>
                        <span className="ml-2 font-medium text-green-600">${selectedAppointment.consultationFee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Medical Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-500 text-sm">Symptoms/Reason:</span>
                        <p className="text-gray-900 mt-1">{selectedAppointment.symptoms}</p>
                      </div>
                      
                      {selectedAppointment.allergies.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-sm">Allergies:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selectedAppointment.allergies.map((allergy, index) => (
                              <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                {allergy}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedAppointment.chronicConditions.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-sm">Chronic Conditions:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selectedAppointment.chronicConditions.map((condition, index) => (
                              <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedAppointment.notes && (
                        <div>
                          <span className="text-gray-500 text-sm">Notes:</span>
                          <p className="text-gray-900 mt-1 p-3 bg-blue-50 rounded-lg">{selectedAppointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowAppointmentModal(false)} className="flex-1">
                    Close
                  </Button>
                  <Button variant="primary" className="flex-1">
                    View Full Medical Records
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Appointment Notes</h3>
                  <button 
                    onClick={() => setShowNotesModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Patient: <span className="font-medium">{selectedAppointment.patientName}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: <span className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}</span>
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Notes
                  </label>
                  <textarea
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    rows={6}
                    placeholder="Enter your notes about this appointment, diagnosis, treatment plan, medications prescribed, follow-up instructions, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowNotesModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSaveNotes} className="flex-1">
                    Save Notes
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
