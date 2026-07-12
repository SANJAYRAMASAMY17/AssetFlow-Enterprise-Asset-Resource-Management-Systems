import { Toaster } from 'react-hot-toast';
import { Outlet, NavLink } from 'react-router';
import { Building2, Users, LayoutDashboard, Tags, Package, ArrowRightLeft, ClipboardList, CalendarDays, Wrench, ClipboardCheck, FileText, Bell, Activity, LogOut, User } from 'lucide-react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';

const navItems = [
  { name: 'Dashboard', path: '/org', icon: LayoutDashboard, exact: true },
  { name: 'Activity', path: '/org/activity', icon: Activity },
  { name: 'Notifications', path: '/org/notifications', icon: Bell },
  { name: 'Reports', path: '/org/reports', icon: FileText },
  { name: 'Assets', path: '/org/assets', icon: Package },
  { name: 'Allocations', path: '/org/allocations', icon: ClipboardList },
  { name: 'Transfers', path: '/org/transfers', icon: ArrowRightLeft },
  { name: 'Bookings', path: '/org/bookings', icon: CalendarDays },
  { name: 'Maintenance', path: '/org/maintenance', icon: Wrench },
  { name: 'Audits', path: '/org/audits', icon: ClipboardCheck },
  { name: 'Departments', path: '/org/departments', icon: Building2 },
  { name: 'Categories', path: '/org/categories', icon: Tags },
  { name: 'Employees', path: '/org/employees', icon: Users },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { data: notifications } = useQuery({
    queryKey: ['notifications', 1, 'all', ''], // just reuse the query key slightly or a specific unread count query
    queryFn: async () => (await apiClient.get('/notifications', { params: { limit: 1 } })).data,
    refetchInterval: 60000
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 flex flex-col bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AssetFlow</h1>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.name}
              </div>
              {item.name === 'Notifications' && notifications?.unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                  {notifications.unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* User profile & Sign out */}
        {user && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gray-600 bg-gray-200 rounded">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2 text-gray-500" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
