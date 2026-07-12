import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class AnalyticsRepository {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      underMaintenance,
      missingAssets,
      todayBookings,
      pendingTransfers,
      activeAudits
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      prisma.asset.count({ where: { status: 'ALLOCATED' } }),
      prisma.asset.count({ where: { status: 'UNDER_MAINTENANCE' } }),
      prisma.asset.count({ where: { status: 'LOST' } }),
      prisma.resourceBooking.count({
        where: {
          startTime: { lte: tomorrow },
          endTime: { gte: today }
        }
      }),
      prisma.transferRequest.count({ where: { status: 'PENDING' } }),
      prisma.auditCycle.count({ where: { status: 'IN_PROGRESS' } })
    ]);

    return {
      totalAssets,
      availableAssets,
      allocatedAssets,
      underMaintenance,
      missingAssets,
      todayBookings,
      pendingTransfers,
      activeAudits
    };
  }

  async getAssetsByCategory() {
    const categories = await prisma.assetCategory.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });
    return categories.map(c => ({ name: c.name, value: c._count.assets })).filter(c => c.value > 0);
  }

  async getAssetsByDepartment() {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });
    return departments.map(d => ({ name: d.name, value: d._count.assets })).filter(d => d.value > 0);
  }
  
  async getMaintenanceTrend() {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    d.setHours(0,0,0,0);
    
    const requests = await prisma.maintenanceRequest.findMany({
      where: { createdAt: { gte: d } },
      select: { createdAt: true }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend: Record<string, number> = {};
    
    for (let i = 0; i < 6; i++) {
        const cd = new Date();
        cd.setMonth(cd.getMonth() - i);
        trend[`${months[cd.getMonth()]} ${cd.getFullYear()}`] = 0;
    }

    requests.forEach(r => {
      const key = `${months[r.createdAt.getMonth()]} ${r.createdAt.getFullYear()}`;
      if (trend[key] !== undefined) {
        trend[key]++;
      }
    });

    return Object.keys(trend).reverse().map(k => ({ name: k, value: trend[k] }));
  }
  
  async getMonthlyBookings() {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    d.setHours(0,0,0,0);
    
    const bookings = await prisma.resourceBooking.findMany({
      where: { createdAt: { gte: d } },
      select: { createdAt: true }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend: Record<string, number> = {};
    
    for (let i = 0; i < 6; i++) {
        const cd = new Date();
        cd.setMonth(cd.getMonth() - i);
        trend[`${months[cd.getMonth()]} ${cd.getFullYear()}`] = 0;
    }

    bookings.forEach(r => {
      const key = `${months[r.createdAt.getMonth()]} ${r.createdAt.getFullYear()}`;
      if (trend[key] !== undefined) {
        trend[key]++;
      }
    });

    return Object.keys(trend).reverse().map(k => ({ name: k, value: trend[k] }));
  }

  async getAssetUtilization() {
    const totalAssets = await prisma.asset.count();
    const allocatedOrReserved = await prisma.asset.count({
      where: { status: { in: ['ALLOCATED', 'RESERVED'] } }
    });
    const maintenance = await prisma.asset.count({
      where: { status: 'UNDER_MAINTENANCE' }
    });
    const available = await prisma.asset.count({
      where: { status: 'AVAILABLE' }
    });
    const other = totalAssets - allocatedOrReserved - maintenance - available;

    return [
      { name: 'In Use/Reserved', value: allocatedOrReserved },
      { name: 'Under Maint.', value: maintenance },
      { name: 'Available', value: available },
      { name: 'Other', value: Math.max(0, other) }
    ].filter(i => i.value > 0);
  }

  // Reports
  async getAssetReport() {
    return prisma.asset.findMany({
      include: { category: { select: { name: true } }, department: { select: { name: true } }, location: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllocationReport() {
    return prisma.assetAllocation.findMany({
      include: { asset: { select: { name: true, assetTag: true } }, user: { select: { name: true, email: true } } },
      orderBy: { allocatedAt: 'desc' }
    });
  }

  async getMaintenanceReport() {
    return prisma.maintenanceRequest.findMany({
      include: { asset: { select: { name: true, assetTag: true } }, requester: { select: { name: true } }, technician: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAuditReport() {
    return prisma.auditCycle.findMany({
      include: { department: { select: { name: true } }, location: { select: { name: true } }, _count: { select: { auditItems: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBookingReport() {
    return prisma.resourceBooking.findMany({
      include: { asset: { select: { name: true, assetTag: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDepartmentReport() {
    return prisma.department.findMany({
      include: { head: { select: { name: true } }, _count: { select: { users: true, assets: true } } },
      orderBy: { name: 'asc' }
    });
  }
}
export const analyticsRepository = new AnalyticsRepository();
