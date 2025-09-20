'use client';

import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { StatCard } from '@/components/Card';
import { 
  Users, 
  FileText, 
  Activity, 
  Shield,
  Clock,
  TrendingUp,
  Database,
  Bell
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuthStore();

  if (!user) return null;

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
        <p className="text-gray-600">Manage your health records and share them securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Records"
          value="12"
          change={{ value: "+2 this month", trend: "up" }}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Recent Access"
          value="3"
          change={{ value: "Last 7 days", trend: "neutral" }}
          icon={<Activity className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Shared Records"
          value="5"
          change={{ value: "Currently active", trend: "neutral" }}
          icon={<Shield className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="Wallet Status"
          value="Connected"
          icon={<Database className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Blood test results uploaded</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Record accessed by Dr. Smith</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">X-ray shared with City Hospital</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Upload Record</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Share Record</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">View QR Code</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Database className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Wallet Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctorDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. {user.name}</h1>
        <p className="text-gray-600">Access patient records and manage your practice.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patients Treated"
          value="127"
          change={{ value: "+12 this week", trend: "up" }}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Records Accessed"
          value="45"
          change={{ value: "Today", trend: "neutral" }}
          icon={<FileText className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Appointments"
          value="8"
          change={{ value: "Today", trend: "neutral" }}
          icon={<Clock className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="Pending Reviews"
          value="3"
          icon={<Bell className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">John Smith</p>
                <p className="text-sm text-gray-600">Last visit: 2 days ago</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm">View Records</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-sm text-gray-600">Last visit: 1 week ago</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm">View Records</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Mike Davis</p>
                <p className="text-sm text-gray-600">Last visit: 2 weeks ago</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm">View Records</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Search Patient</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Upload Record</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Shield className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">QR Scanner</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHospitalAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
        <p className="text-gray-600">Manage your hospital&apos;s doctors, patients, and operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Doctors"
          value="45"
          change={{ value: "+3 this month", trend: "up" }}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Patient Records"
          value="1,247"
          change={{ value: "+89 this week", trend: "up" }}
          icon={<FileText className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Daily Access"
          value="324"
          change={{ value: "+12% vs yesterday", trend: "up" }}
          icon={<Activity className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="System Health"
          value="99.9%"
          change={{ value: "Uptime", trend: "up" }}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cardiology</span>
              <span className="text-sm font-medium">12 doctors, 156 patients</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Emergency</span>
              <span className="text-sm font-medium">8 doctors, 89 patients</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pediatrics</span>
              <span className="text-sm font-medium">6 doctors, 234 patients</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Orthopedics</span>
              <span className="text-sm font-medium">9 doctors, 178 patients</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Manage Doctors</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Patient Management</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Access Logs</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-600">Monitor and manage the entire MediChain.AI platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="12,543"
          change={{ value: "+234 this week", trend: "up" }}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Total Records"
          value="45,321"
          change={{ value: "+1,234 today", trend: "up" }}
          icon={<FileText className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Blockchain Txns"
          value="8,765"
          change={{ value: "+123 today", trend: "up" }}
          icon={<Database className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="Active Hospitals"
          value="156"
          change={{ value: "+5 this month", trend: "up" }}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium text-green-600">245ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Performance</span>
              <span className="text-sm font-medium text-green-600">Optimal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blockchain Sync</span>
              <span className="text-sm font-medium text-green-600">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Service</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium">User Management</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Security Audit</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Database className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Blockchain Status</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Bell className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Support Tickets</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  switch (user.role) {
    case 'patient':
      return renderPatientDashboard();
    case 'doctor':
      return renderDoctorDashboard();
    case 'hospital_admin':
      return renderHospitalAdminDashboard();
    case 'system_admin':
      return renderSystemAdminDashboard();
    default:
      return <div>Unknown user role</div>;
  }
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
