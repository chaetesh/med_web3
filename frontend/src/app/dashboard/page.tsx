'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/lib/types/auth.types';
import { DashboardApiService, DashboardData } from '@/lib/services/dashboard.service';
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await DashboardApiService.getDashboardData(user.role, user.hospitalId);
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.firstName} {user.lastName}</h1>
        <p className="text-gray-600">Manage your health records and share them securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Records"
          value={dashboardData?.stats.totalRecords?.toString() || '0'}
          change={{ value: "+2 this month", trend: "up" }}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Recent Access"
          value={dashboardData?.stats.recentAccess?.toString() || '0'}
          change={{ value: "Last 7 days", trend: "neutral" }}
          icon={<Activity className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Shared Records"
          value={dashboardData?.stats.sharedRecords?.toString() || '0'}
          change={{ value: "Currently active", trend: "neutral" }}
          icon={<Shield className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="Wallet Status"
          value={dashboardData?.stats.walletStatus || 'Disconnected'}
          icon={<Database className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 
                  activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. {user.firstName} {user.lastName}</h1>
        <p className="text-gray-600">Access patient records and manage your practice.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patients Treated"
          value={dashboardData?.stats.totalPatients?.toString() || '0'}
          change={{ value: "+12 this week", trend: "up" }}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Records Accessed"
          value={dashboardData?.stats.totalRecords?.toString() || '0'}
          change={{ value: "Today", trend: "neutral" }}
          icon={<FileText className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Appointments"
          value={dashboardData?.stats.appointmentsToday?.toString() || '0'}
          change={{ value: "Today", trend: "neutral" }}
          icon={<Clock className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title="Pending Reviews"
          value={dashboardData?.stats.pendingReviews?.toString() || '0'}
          icon={<Bell className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-600">{new Date(activity.timestamp).toLocaleDateString()}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
              </div>
            )) || (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
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
    case UserRole.PATIENT:
      return renderPatientDashboard();
    case UserRole.DOCTOR:
      return renderDoctorDashboard();
    case UserRole.HOSPITAL_ADMIN:
      return renderHospitalAdminDashboard();
    case UserRole.SYSTEM_ADMIN:
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
