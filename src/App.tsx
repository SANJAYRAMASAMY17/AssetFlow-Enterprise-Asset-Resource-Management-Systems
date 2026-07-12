/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { Layout } from './components/layout/Layout.tsx';
import { OrganizationDashboard } from './pages/Organization/Dashboard.tsx';
import { DepartmentsPage } from './pages/Organization/Departments.tsx';
import { CategoriesPage } from './pages/Organization/Categories.tsx';
import { EmployeesPage } from './pages/Organization/Employees.tsx';
import { AssetsPage } from './pages/Assets/AssetsList.tsx';
import { CreateAssetPage } from './pages/Assets/CreateAsset.tsx';
import { AssetDetailsPage } from './pages/Assets/AssetDetails.tsx';
import { EditAssetPage } from './pages/Assets/EditAsset.tsx';

import { AllocationsList } from './pages/Allocations/AllocationsList.tsx';
import { AssignAssetPage } from './pages/Allocations/AssignAsset.tsx';
import { ReturnAssetPage } from './pages/Allocations/ReturnAsset.tsx';
import { AllocationHistoryPage } from './pages/Allocations/AllocationHistory.tsx';
import { TransfersList } from './pages/Transfers/TransfersList.tsx';
import { CreateTransferPage } from './pages/Transfers/CreateTransfer.tsx';
import { BookingsList } from './pages/Bookings/BookingsList.tsx';
import { BookingCalendarPage } from './pages/Bookings/BookingCalendar.tsx';
import { CreateBookingPage } from './pages/Bookings/CreateBooking.tsx';
import { BookingDetailsPage } from './pages/Bookings/BookingDetails.tsx';
import { MaintenanceList } from './pages/Maintenance/MaintenanceList.tsx';
import { CreateMaintenancePage } from './pages/Maintenance/CreateMaintenance.tsx';
import { MaintenanceDetailsPage } from './pages/Maintenance/MaintenanceDetails.tsx';
import { AuditList } from './pages/Audit/AuditList.tsx';
import { CreateAuditPage } from './pages/Audit/CreateAudit.tsx';
import { AuditDetailsPage } from './pages/Audit/AuditDetails.tsx';
import { ReportsList } from './pages/Reports/ReportsList.tsx';
import { NotificationList } from './pages/Notifications/NotificationList.tsx';
import { ActivityTimeline } from './pages/Activity/ActivityTimeline.tsx';

import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LoginPage } from './pages/Auth/Login.tsx';

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Authenticating employee session...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/org" replace />} />
      <Route path="/org" element={<Layout />}>
        <Route index element={<OrganizationDashboard />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="assets/create" element={<CreateAssetPage />} />
        <Route path="assets/:id" element={<AssetDetailsPage />} />
        <Route path="assets/:id/edit" element={<EditAssetPage />} />
        <Route path="allocations" element={<AllocationsList />} />
        <Route path="allocations/assign" element={<AssignAssetPage />} />
        <Route path="allocations/history" element={<AllocationHistoryPage />} />
        <Route path="allocations/:id/return" element={<ReturnAssetPage />} />
        <Route path="transfers" element={<TransfersList />} />
        <Route path="transfers/create" element={<CreateTransferPage />} />
        <Route path="bookings" element={<BookingsList />} />
        <Route path="bookings/calendar" element={<BookingCalendarPage />} />
        <Route path="bookings/create" element={<CreateBookingPage />} />
        <Route path="bookings/:id" element={<BookingDetailsPage />} />
        <Route path="maintenance" element={<MaintenanceList />} />
        <Route path="maintenance/create" element={<CreateMaintenancePage />} />
        <Route path="maintenance/:id" element={<MaintenanceDetailsPage />} />
        <Route path="audits" element={<AuditList />} />
        <Route path="audits/create" element={<CreateAuditPage />} />
        <Route path="audits/:id" element={<AuditDetailsPage />} />
        <Route path="reports" element={<ReportsList />} />
        <Route path="notifications" element={<NotificationList />} />
        <Route path="activity" element={<ActivityTimeline />} />
      </Route>
      <Route path="*" element={<Navigate to="/org" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
