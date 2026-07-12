import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client.ts';
import { Building2, Package, Users, AlertCircle, ArrowRightLeft, CheckCircle2, Calendar, Clock, Inbox, Wrench, PenTool, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function OrganizationDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => (await apiClient.get('/analytics/dashboard')).data
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard data</div>;
  }

  const { stats, charts } = data;

  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

  const overviewStats = [
    { name: 'Total Assets', stat: stats.totalAssets, icon: Package, link: '/org/assets', color: 'text-gray-900', bg: 'bg-gray-100' },
    { name: 'Available Assets', stat: stats.availableAssets, icon: CheckCircle2, link: '/org/assets?status=AVAILABLE', color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Allocated Assets', stat: stats.allocatedAssets, icon: Users, link: '/org/allocations', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Under Maintenance', stat: stats.underMaintenance, icon: Wrench, link: '/org/assets?status=UNDER_MAINTENANCE', color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Today\'s Bookings', stat: stats.todayBookings, icon: Calendar, link: '/org/bookings/calendar', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Pending Transfers', stat: stats.pendingTransfers, icon: ArrowRightLeft, link: '/org/transfers?status=PENDING', color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Active Audits', stat: stats.activeAudits, icon: ClipboardCheck, link: '/org/audits?status=IN_PROGRESS', color: 'text-teal-600', bg: 'bg-teal-100' },
    { name: 'Missing Assets', stat: stats.missingAssets, icon: AlertCircle, link: '/org/assets?status=LOST', color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of organization assets and resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((item) => (
          <Link key={item.name} to={item.link} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{item.stat}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-900 mb-6">Assets by Category</h3>
          <div className="h-64">
            {charts.assetsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.assetsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Asset Utilization */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-900 mb-6">Asset Utilization</h3>
          <div className="h-64">
            {charts.utilization.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.utilization}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.utilization.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Maintenance Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-900 mb-6">Maintenance Trend (Last 6 Months)</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.maintenanceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-900 mb-6">Monthly Bookings (Last 6 Months)</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyBookings}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Assets by Department */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-medium text-gray-900 mb-6">Assets by Department</h3>
        <div className="h-64">
          {charts.assetsByDepartment.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.assetsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
