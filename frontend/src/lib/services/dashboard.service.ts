import { config } from '../config/env';
import { AuthApiService } from './auth.service';
import { UserRole } from '../types/auth.types';

// API configuration
const API_BASE_URL = config.api.baseUrl;

// Dashboard data interfaces
export interface DashboardStats {
  totalRecords?: number;
  recentAccess?: number;
  sharedRecords?: number;
  walletStatus?: string;
  totalPatients?: number;
  totalDoctors?: number;
  appointmentsToday?: number;
  pendingReviews?: number;
  dailyAccess?: number;
  systemHealth?: string;
  totalUsers?: number;
  blockchainTxns?: number;
  activeHospitals?: number;
}

export interface RecentActivity {
  id: string;
  type: 'upload' | 'access' | 'share' | 'appointment' | 'system';
  description: string;
  timestamp: Date;
  status?: 'success' | 'pending' | 'error';
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  quickActions?: any[];
}

// Generic API request handler for dashboard
async function dashboardApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Get token from localStorage
  const token = AuthApiService.getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error('Dashboard API request failed:', error);
    throw error;
  }
}

export class DashboardApiService {
  /**
   * Get dashboard data for patient
   */
  static async getPatientDashboard(): Promise<DashboardData> {
    try {
      // Get patient's medical records
      const records = await dashboardApiRequest<any[]>('/medical-records');
      
      // Calculate stats
      const stats: DashboardStats = {
        totalRecords: records.length,
        recentAccess: records.filter(r => {
          const recordDate = new Date(r.lastAccessed || r.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return recordDate > weekAgo;
        }).length,
        sharedRecords: records.filter(r => r.sharedWith && r.sharedWith.length > 0).length,
        walletStatus: 'Connected', // This would come from wallet service
      };

      // Generate recent activity from records
      const recentActivity: RecentActivity[] = records
        .slice(0, 3)
        .map((record, index) => ({
          id: record._id,
          type: 'upload' as const,
          description: `${record.title} uploaded`,
          timestamp: new Date(record.createdAt),
          status: 'success' as const,
        }));

      return { stats, recentActivity };
    } catch (error) {
      console.error('Failed to fetch patient dashboard:', error);
      // Return default data on error
      return {
        stats: {
          totalRecords: 0,
          recentAccess: 0,
          sharedRecords: 0,
          walletStatus: 'Disconnected',
        },
        recentActivity: [],
      };
    }
  }

  /**
   * Get dashboard data for doctor
   */
  static async getDoctorDashboard(): Promise<DashboardData> {
    try {
      // Get records shared with doctor
      const sharedRecords = await dashboardApiRequest<any[]>('/medical-records');
      
      const stats: DashboardStats = {
        totalPatients: new Set(sharedRecords.map(r => r.patientId)).size,
        totalRecords: sharedRecords.length,
        appointmentsToday: 8, // This would come from appointments API
        pendingReviews: 3, // This would come from a reviews/tasks API
      };

      const recentActivity: RecentActivity[] = sharedRecords
        .slice(0, 3)
        .map((record) => ({
          id: record._id,
          type: 'access' as const,
          description: `Accessed ${record.title}`,
          timestamp: new Date(record.lastAccessed || record.createdAt),
          status: 'success' as const,
        }));

      return { stats, recentActivity };
    } catch (error) {
      console.error('Failed to fetch doctor dashboard:', error);
      return {
        stats: {
          totalPatients: 0,
          totalRecords: 0,
          appointmentsToday: 0,
          pendingReviews: 0,
        },
        recentActivity: [],
      };
    }
  }

  /**
   * Get dashboard data for hospital admin
   */
  static async getHospitalAdminDashboard(hospitalId?: string): Promise<DashboardData> {
    try {
      // Get hospital doctors
      const doctors = hospitalId 
        ? await dashboardApiRequest<any[]>(`/users/hospital/${hospitalId}/doctors`)
        : [];

      const stats: DashboardStats = {
        totalDoctors: doctors.length,
        totalRecords: 1247, // This would come from aggregated records API
        dailyAccess: 324, // This would come from access logs API
        systemHealth: '99.9%',
      };

      const recentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'system',
          description: 'New doctor registered',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'success',
        },
        {
          id: '2',
          type: 'system',
          description: 'System backup completed',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'success',
        },
      ];

      return { stats, recentActivity };
    } catch (error) {
      console.error('Failed to fetch hospital admin dashboard:', error);
      return {
        stats: {
          totalDoctors: 0,
          totalRecords: 0,
          dailyAccess: 0,
          systemHealth: 'Unknown',
        },
        recentActivity: [],
      };
    }
  }

  /**
   * Get dashboard data for system admin
   */
  static async getSystemAdminDashboard(): Promise<DashboardData> {
    try {
      // This would typically call multiple admin endpoints
      const stats: DashboardStats = {
        totalUsers: 12543,
        totalRecords: 45321,
        blockchainTxns: 8765,
        activeHospitals: 156,
        systemHealth: '99.9%',
      };

      const recentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'system',
          description: 'System health check completed',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          status: 'success',
        },
        {
          id: '2',
          type: 'system',
          description: 'New hospital registered',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          status: 'success',
        },
      ];

      return { stats, recentActivity };
    } catch (error) {
      console.error('Failed to fetch system admin dashboard:', error);
      return {
        stats: {
          totalUsers: 0,
          totalRecords: 0,
          blockchainTxns: 0,
          activeHospitals: 0,
          systemHealth: 'Unknown',
        },
        recentActivity: [],
      };
    }
  }

  /**
   * Get dashboard data based on user role
   */
  static async getDashboardData(role: UserRole, hospitalId?: string): Promise<DashboardData> {
    switch (role) {
      case UserRole.PATIENT:
        return this.getPatientDashboard();
      case UserRole.DOCTOR:
        return this.getDoctorDashboard();
      case UserRole.HOSPITAL_ADMIN:
        return this.getHospitalAdminDashboard(hospitalId);
      case UserRole.SYSTEM_ADMIN:
        return this.getSystemAdminDashboard();
      default:
        throw new Error(`Unsupported user role: ${role}`);
    }
  }
}