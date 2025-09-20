'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import PageHeader from '@/components/PageHeader';
import { Card, StatCard } from '@/components/Card';
import Button from '@/components/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  Heart,
  Building
} from 'lucide-react';

// Enhanced data sets
const monthlyUsageData = [
  { name: 'Jan', patients: 4000, doctors: 300, records: 2400, revenue: 8000 },
  { name: 'Feb', patients: 3000, doctors: 280, records: 1398, revenue: 7200 },
  { name: 'Mar', patients: 5000, doctors: 320, records: 2800, revenue: 9500 },
  { name: 'Apr', patients: 2780, doctors: 290, records: 3908, revenue: 6800 },
  { name: 'May', patients: 1890, doctors: 310, records: 4800, revenue: 7800 },
  { name: 'Jun', patients: 2390, doctors: 350, records: 3800, revenue: 8900 },
  { name: 'Jul', patients: 3490, doctors: 380, records: 4300, revenue: 9200 },
];

const departmentData = [
  { name: 'Cardiology', patients: 850, records: 1200, revenue: 25000, color: '#0088FE' },
  { name: 'Neurology', patients: 720, records: 980, revenue: 22000, color: '#00C49F' },
  { name: 'Oncology', patients: 650, records: 890, revenue: 28000, color: '#FFBB28' },
  { name: 'Pediatrics', patients: 920, records: 1100, revenue: 18000, color: '#FF8042' },
  { name: 'Orthopedics', patients: 580, records: 750, revenue: 20000, color: '#8884D8' },
  { name: 'Emergency', patients: 1200, records: 1500, revenue: 15000, color: '#82CA9D' },
];

const dailyActivityData = [
  { time: '00:00', access: 12, uploads: 5 },
  { time: '04:00', access: 8, uploads: 2 },
  { time: '08:00', access: 45, uploads: 20 },
  { time: '12:00', access: 78, uploads: 35 },
  { time: '16:00', access: 65, uploads: 28 },
  { time: '20:00', access: 32, uploads: 15 },
];

const performanceData = [
  { name: 'Response Time', value: 85, fill: '#0088FE' },
  { name: 'Uptime', value: 99, fill: '#00C49F' },
  { name: 'Data Accuracy', value: 97, fill: '#FFBB28' },
  { name: 'User Satisfaction', value: 92, fill: '#FF8042' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function HospitalAnalyticsPage() {
  // Calculate summary statistics
  const totalPatients = monthlyUsageData.reduce((sum, month) => sum + month.patients, 0);
  const totalDoctors = Math.max(...monthlyUsageData.map(month => month.doctors));
  const totalRecords = monthlyUsageData.reduce((sum, month) => sum + month.records, 0);
  const totalRevenue = monthlyUsageData.reduce((sum, month) => sum + month.revenue, 0);

  return (
    <ProtectedRoute allowedRoles={['hospital_admin']}>
      <div className="space-y-6">
        <PageHeader
          title="Hospital Analytics"
          description="Comprehensive analytics and insights for your hospital operations"
        >
          <Button variant="primary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </PageHeader>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={totalPatients.toLocaleString()}
            change={{ value: "8.2% vs last period", trend: "up" }}
            icon={<Users className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Active Doctors"
            value={totalDoctors.toString()}
            change={{ value: "12 new this month", trend: "up" }}
            icon={<Heart className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Medical Records"
            value={totalRecords.toLocaleString()}
            change={{ value: "15.3% increase", trend: "up" }}
            icon={<FileText className="w-6 h-6 text-purple-600" />}
          />
          <StatCard
            title="Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            change={{ value: "5.1% vs last period", trend: "up" }}
            icon={<DollarSign className="w-6 h-6 text-orange-600" />}
          />
        </div>

        {/* Monthly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Monthly Patient & Doctor Trends">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'patients' ? 'Patients' : 'Doctors']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  stackId="1" 
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="doctors" 
                  stackId="2" 
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Revenue & Records Correlation">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Records'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="records" fill="#FFBB28" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FF8042" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Department Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Department Performance">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value}` : value,
                    name === 'patients' ? 'Patients' : name === 'records' ? 'Records' : 'Revenue'
                  ]}
                />
                <Legend />
                <Bar dataKey="patients" fill="#0088FE" />
                <Bar dataKey="records" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Department Revenue Distribution">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Activity and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Daily Activity Pattern">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'access' ? 'System Access' : 'Record Uploads']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="access" 
                  stackId="1" 
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="uploads" 
                  stackId="2" 
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card title="System Performance Metrics">
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={performanceData}>
                <RadialBar 
                  label={{ position: 'insideStart', fill: '#fff' }} 
                  background 
                  dataKey="value" 
                />
                <Legend 
                  iconSize={18} 
                  wrapperStyle={{
                    top: '50%',
                    right: '0%',
                    transform: 'translate(0, -50%)',
                    lineHeight: '24px',
                  }}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
              </RadialBarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Detailed Department Table */}
        <Card title="Department Statistics">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Revenue/Patient
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.map((dept) => (
                  <tr key={dept.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: dept.color }}
                        ></div>
                        <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.patients.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.records.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${dept.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Math.round(dept.revenue / dept.patients).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
