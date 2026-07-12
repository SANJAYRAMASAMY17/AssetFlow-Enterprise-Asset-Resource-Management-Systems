import { analyticsRepository } from '../repositories/analytics.repository.ts';

export class AnalyticsService {
  async getDashboardData() {
    const [
      stats,
      assetsByCategory,
      assetsByDepartment,
      maintenanceTrend,
      monthlyBookings,
      utilization
    ] = await Promise.all([
      analyticsRepository.getDashboardStats(),
      analyticsRepository.getAssetsByCategory(),
      analyticsRepository.getAssetsByDepartment(),
      analyticsRepository.getMaintenanceTrend(),
      analyticsRepository.getMonthlyBookings(),
      analyticsRepository.getAssetUtilization()
    ]);

    return {
      stats,
      charts: {
        assetsByCategory,
        assetsByDepartment,
        maintenanceTrend,
        monthlyBookings,
        utilization
      }
    };
  }

  async getReport(type: string) {
    switch (type) {
      case 'assets': return analyticsRepository.getAssetReport();
      case 'allocations': return analyticsRepository.getAllocationReport();
      case 'maintenance': return analyticsRepository.getMaintenanceReport();
      case 'audits': return analyticsRepository.getAuditReport();
      case 'bookings': return analyticsRepository.getBookingReport();
      case 'departments': return analyticsRepository.getDepartmentReport();
      default: throw new Error('Invalid report type');
    }
  }
}
export const analyticsService = new AnalyticsService();
