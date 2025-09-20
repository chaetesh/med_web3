'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/Card';
import Button from '@/components/Button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  FileText, 
  Shield,
  Bell,
  Key,
  Edit,
  Save,
  Camera,
  Award,
  Calendar
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  hospital: string;
  licenseNumber: string;
  experience: number;
  education: string[];
  certifications: string[];
  address: string;
  bio: string;
  profilePicture?: string;
  verified: boolean;
  joinedDate: string;
  patientsServed: number;
  recordsUploaded: number;
}

export default function DoctorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile>({
    id: 'DR001',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@cityhospital.com',
    phone: '+1-555-0123',
    specialization: 'Cardiology',
    department: 'Cardiovascular Department',
    hospital: 'City General Hospital',
    licenseNumber: 'MD-2019-4567',
    experience: 8,
    education: [
      'MD - Harvard Medical School (2016)',
      'BS in Biology - Stanford University (2012)'
    ],
    certifications: [
      'Board Certified in Cardiology',
      'Advanced Cardiac Life Support (ACLS)',
      'Echocardiography Certification'
    ],
    address: '123 Medical Plaza, New York, NY 10001',
    bio: 'Experienced cardiologist with 8 years of practice, specializing in interventional cardiology and heart disease prevention. Passionate about patient care and advancing cardiac treatment methods.',
    verified: true,
    joinedDate: '2022-01-15',
    patientsServed: 847,
    recordsUploaded: 1234
  });

  const [tempProfile, setTempProfile] = useState<DoctorProfile>(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setTempProfile({ ...profile });
  };

  const handleSave = () => {
    setProfile({ ...tempProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setIsEditing(false);
  };

  const updateField = (field: keyof DoctorProfile, value: any) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="space-y-6">
        <PageHeader
          title="Doctor Profile"
          description="Manage your professional information and settings"
        >
          {!isEditing ? (
            <Button variant="primary" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center space-y-4">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt={profile.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Basic Info */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.specialization}</p>
                  <p className="text-sm text-gray-500">{profile.hospital}</p>
                  {profile.verified && (
                    <div className="flex items-center justify-center mt-2">
                      <Shield className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Verified Doctor</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.patientsServed}</div>
                    <div className="text-xs text-gray-500">Patients Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile.recordsUploaded}</div>
                    <div className="text-xs text-gray-500">Records Uploaded</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempProfile.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{profile.phone}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.licenseNumber}
                      onChange={(e) => updateField('licenseNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Key className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{profile.licenseNumber}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    value={tempProfile.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{profile.address}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Professional Information */}
            <Card title="Professional Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  {isEditing ? (
                    <select
                      value={tempProfile.specialization}
                      onChange={(e) => updateField('specialization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="General Practice">General Practice</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.specialization}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.department}
                      onChange={(e) => updateField('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{profile.department}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
                  <p className="text-gray-900">{profile.hospital}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={tempProfile.experience}
                      onChange={(e) => updateField('experience', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.experience} years</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={tempProfile.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about your experience and expertise..."
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio}</p>
                )}
              </div>
            </Card>

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Education">
                <div className="space-y-3">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">{edu}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card title="Certifications">
                <div className="space-y-3">
                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">{cert}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Account Information */}
            <Card title="Account Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{new Date(profile.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-600 font-medium">Verified & Active</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Security Settings */}
        <Card title="Security & Privacy">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
              <p className="text-sm text-gray-600 mb-3">Update your account password for security</p>
              <Button size="sm" variant="outline">Change Password</Button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Two-Factor Auth</h4>
              <p className="text-sm text-gray-600 mb-3">Add an extra layer of security</p>
              <Button size="sm" variant="outline">Enable 2FA</Button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Notifications</h4>
              <p className="text-sm text-gray-600 mb-3">Manage your notification preferences</p>
              <Button size="sm" variant="outline">Settings</Button>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
