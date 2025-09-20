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
  FileText
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  hospitalId: string;
  rating: number;
  experience: number;
  consultationFee: number;
  avatar?: string;
  availableSlots: {
    date: string;
    times: string[];
  }[];
  nextAvailableDate: string;
  qualifications: string[];
  languages: string[];
  about: string;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  specialties: string[];
  facilities: string[];
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  type: 'consultation' | 'follow-up' | 'emergency';
  symptoms?: string;
  notes?: string;
  fee: number;
}

export default function PatientAppointmentPage() {
  const [activeTab, setActiveTab] = useState<'book' | 'scheduled'>('book');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  // Mock data - replace with actual API calls
  const hospitals: Hospital[] = [
    {
      id: 'H001',
      name: 'City General Hospital',
      address: '123 Medical Center Drive, City, State 12345',
      phone: '+1-555-0100',
      email: 'info@citygeneral.com',
      rating: 4.8,
      specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Internal Medicine'],
      facilities: ['Emergency Room', 'ICU', 'Surgical Center', 'Diagnostic Imaging']
    },
    {
      id: 'H002',
      name: 'Metropolitan Medical Center',
      address: '456 Healthcare Boulevard, City, State 12345',
      phone: '+1-555-0200',
      email: 'contact@metmedical.com',
      rating: 4.6,
      specialties: ['Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry'],
      facilities: ['Maternity Ward', 'Pediatric ICU', 'Outpatient Clinic', 'Laboratory']
    },
    {
      id: 'H003',
      name: 'Advanced Care Institute',
      address: '789 Wellness Way, City, State 12345',
      phone: '+1-555-0300',
      email: 'appointments@advancedcare.com',
      rating: 4.9,
      specialties: ['Oncology', 'Radiology', 'Cardiology', 'Gastroenterology'],
      facilities: ['Cancer Center', 'Advanced Imaging', 'Heart Center', 'Research Lab']
    }
  ];

  const doctors: Doctor[] = [
    {
      id: 'D001',
      name: 'Dr. Sarah Wilson',
      specialization: 'Cardiology',
      hospital: 'City General Hospital',
      hospitalId: 'H001',
      rating: 4.9,
      experience: 15,
      consultationFee: 200,
      availableSlots: [
        {
          date: '2024-07-25',
          times: ['09:00', '10:30', '14:00', '15:30']
        },
        {
          date: '2024-07-26',
          times: ['09:00', '11:00', '13:30', '16:00']
        }
      ],
      nextAvailableDate: '2024-07-25',
      qualifications: ['MD Cardiology', 'FACC', 'FSCAI'],
      languages: ['English', 'Spanish'],
      about: 'Dr. Wilson is a board-certified cardiologist with over 15 years of experience treating heart conditions. She specializes in interventional cardiology and preventive heart care.'
    },
    {
      id: 'D002',
      name: 'Dr. Michael Chen',
      specialization: 'Neurology',
      hospital: 'City General Hospital',
      hospitalId: 'H001',
      rating: 4.8,
      experience: 12,
      consultationFee: 250,
      availableSlots: [
        {
          date: '2024-07-25',
          times: ['10:00', '13:00', '15:00']
        },
        {
          date: '2024-07-27',
          times: ['09:30', '12:00', '14:30']
        }
      ],
      nextAvailableDate: '2024-07-25',
      qualifications: ['MD Neurology', 'Fellowship in Movement Disorders'],
      languages: ['English', 'Mandarin'],
      about: 'Dr. Chen specializes in neurological disorders with a focus on movement disorders, epilepsy, and stroke care. He has published extensively in peer-reviewed journals.'
    },
    {
      id: 'D003',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Pediatrics',
      hospital: 'Metropolitan Medical Center',
      hospitalId: 'H002',
      rating: 4.7,
      experience: 10,
      consultationFee: 150,
      availableSlots: [
        {
          date: '2024-07-24',
          times: ['08:00', '09:30', '11:00', '14:00', '16:30']
        },
        {
          date: '2024-07-25',
          times: ['08:30', '10:00', '13:30', '15:00']
        }
      ],
      nextAvailableDate: '2024-07-24',
      qualifications: ['MD Pediatrics', 'Board Certified'],
      languages: ['English', 'Spanish'],
      about: 'Dr. Rodriguez is passionate about providing comprehensive care for children from infancy through adolescence. She has a special interest in developmental pediatrics.'
    },
    {
      id: 'D004',
      name: 'Dr. James Thompson',
      specialization: 'Oncology',
      hospital: 'Advanced Care Institute',
      hospitalId: 'H003',
      rating: 4.9,
      experience: 20,
      consultationFee: 300,
      availableSlots: [
        {
          date: '2024-07-26',
          times: ['09:00', '11:30', '14:00']
        },
        {
          date: '2024-07-29',
          times: ['10:00', '13:00', '15:30']
        }
      ],
      nextAvailableDate: '2024-07-26',
      qualifications: ['MD Oncology', 'Fellowship in Hematology-Oncology', 'Research Director'],
      languages: ['English'],
      about: 'Dr. Thompson is a leading oncologist with 20 years of experience in cancer treatment and research. He specializes in personalized cancer therapy and clinical trials.'
    }
  ];

  const myAppointments: Appointment[] = [
    {
      id: 'A001',
      doctorId: 'D001',
      doctorName: 'Dr. Sarah Wilson',
      hospitalName: 'City General Hospital',
      date: '2024-07-25',
      time: '10:30',
      status: 'scheduled',
      type: 'consultation',
      symptoms: 'Chest pain, shortness of breath',
      fee: 200
    },
    {
      id: 'A002',
      doctorId: 'D003',
      doctorName: 'Dr. Emily Rodriguez',
      hospitalName: 'Metropolitan Medical Center',
      date: '2024-07-20',
      time: '14:00',
      status: 'completed',
      type: 'follow-up',
      notes: 'Regular checkup for child',
      fee: 150
    },
    {
      id: 'A003',
      doctorId: 'D002',
      doctorName: 'Dr. Michael Chen',
      hospitalName: 'City General Hospital',
      date: '2024-07-15',
      time: '15:00',
      status: 'cancelled',
      type: 'consultation',
      symptoms: 'Headaches, dizziness',
      fee: 250
    }
  ];

  const specialties = ['all', 'Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Orthopedics', 'Dermatology', 'Psychiatry', 'Gynecology', 'Internal Medicine'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialization === selectedSpecialty;
    const matchesHospital = selectedHospital === 'all' || doctor.hospitalId === selectedHospital;
    
    return matchesSearch && matchesSpecialty && matchesHospital;
  });

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
    setSelectedDate('');
    setSelectedTime('');
    setSymptoms('');
    setNotes('');
  };

  const handleConfirmBooking = () => {
    // Here you would typically make an API call to book the appointment
    console.log('Booking appointment:', {
      doctorId: selectedDoctor?.id,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      symptoms,
      notes
    });
    
    setShowBookingModal(false);
    setSelectedDoctor(null);
    // Show success message or redirect
    alert('Appointment booked successfully!');
  };

  const totalAppointments = myAppointments.length;
  const scheduledAppointments = myAppointments.filter(a => a.status === 'scheduled').length;
  const completedAppointments = myAppointments.filter(a => a.status === 'completed').length;
  const upcomingToday = myAppointments.filter(a => 
    a.status === 'scheduled' && new Date(a.date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="space-y-6">
        <PageHeader
          title="Appointments"
          description="Book new appointments and manage your scheduled visits"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Appointments"
            value={totalAppointments.toString()}
            change={{ value: "All time", trend: "neutral" }}
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Scheduled"
            value={scheduledAppointments.toString()}
            change={{ value: "Upcoming visits", trend: "up" }}
            icon={<Clock className="w-6 h-6 text-orange-600" />}
          />
          <StatCard
            title="Completed"
            value={completedAppointments.toString()}
            change={{ value: "Past visits", trend: "neutral" }}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Today"
            value={upcomingToday.toString()}
            change={{ value: "Appointments today", trend: "neutral" }}
            icon={<Activity className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('book')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'book'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Book Appointment
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scheduled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              My Appointments ({scheduledAppointments})
            </button>
          </nav>
        </div>

        {activeTab === 'book' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search doctors or hospitals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Hospitals</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </Card>

            {/* Doctors List */}
            <Card title={`Available Doctors (${filteredDoctors.length} found)`}>
              <div className="space-y-6">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                          <p className="text-blue-600 font-medium mb-1">{doctor.specialization}</p>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <Building className="w-4 h-4 mr-1" />
                            <span>{doctor.hospital}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span>{doctor.rating}</span>
                            </div>
                            <span>{doctor.experience} years experience</span>
                            <span className="font-medium text-green-600">${doctor.consultationFee}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={() => handleBookAppointment(doctor)}
                        className="ml-4"
                      >
                        Book Appointment
                      </Button>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 text-sm">{doctor.about}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Qualifications:</span>
                        <div className="mt-1 space-y-1">
                          {doctor.qualifications.map((qual, index) => (
                            <span key={index} className="block text-gray-600">{qual}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Languages:</span>
                        <div className="mt-1">
                          <span className="text-gray-600">{doctor.languages.join(', ')}</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Next Available:</span>
                        <div className="mt-1">
                          <span className="text-green-600 font-medium">
                            {new Date(doctor.nextAvailableDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-500">No doctors match your current search criteria.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <Card title="My Appointments">
              <div className="space-y-4">
                {myAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                          <p className="text-sm text-gray-600">{appointment.hospitalName}</p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                            <Clock className="w-4 h-4 ml-3 mr-1" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="ml-2 capitalize">{appointment.type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Fee:</span>
                        <span className="ml-2 text-green-600 font-medium">${appointment.fee}</span>
                      </div>
                    </div>

                    {appointment.symptoms && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Symptoms:</span>
                        <p className="text-sm text-gray-600 mt-1">{appointment.symptoms}</p>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-3 border-t border-gray-200">
                      {appointment.status === 'scheduled' && (
                        <>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="danger" size="sm">
                            Cancel
                          </Button>
                        </>
                      )}
                      {appointment.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {myAppointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                  <p className="text-gray-500">You don't have any appointments yet. Book your first appointment!</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedDoctor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
                  <button 
                    onClick={() => setShowBookingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Doctor Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{selectedDoctor.name}</h4>
                    <p className="text-blue-600 text-sm">{selectedDoctor.specialization}</p>
                    <p className="text-gray-600 text-sm">{selectedDoctor.hospital}</p>
                    <p className="text-green-600 font-medium text-sm mt-1">Fee: ${selectedDoctor.consultationFee}</p>
                  </div>

                  {/* Appointment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type
                    </label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a date</option>
                      {selectedDoctor.availableSlots.map((slot) => (
                        <option key={slot.date} value={slot.date}>
                          {new Date(slot.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDoctor.availableSlots
                          .find(slot => slot.date === selectedDate)
                          ?.times.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`px-3 py-2 border rounded-lg text-sm ${
                                selectedTime === time
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms / Reason for Visit
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={3}
                      placeholder="Please describe your symptoms or reason for the visit..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Any additional information..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleConfirmBooking}
                    disabled={!selectedDate || !selectedTime || !symptoms.trim()}
                    className="flex-1"
                  >
                    Book Appointment
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
