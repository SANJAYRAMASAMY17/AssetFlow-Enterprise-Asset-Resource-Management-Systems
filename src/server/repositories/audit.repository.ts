import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class AuditRepository {
  async findAllCycles(query: any) {
    const where: Prisma.AuditCycleWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.auditCycle.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } },
          auditors: { select: { id: true, name: true, email: true } },
          _count: { select: { auditItems: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditCycle.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findCycleById(id: string) {
    return prisma.auditCycle.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
        auditors: { select: { id: true, name: true, email: true } },
        auditItems: {
          include: {
            asset: { select: { id: true, name: true, assetTag: true, status: true, categoryId: true } },
            auditedBy: { select: { id: true, name: true } }
          }
        }
      }
    });
  }

  async createCycle(data: any) {
    return prisma.auditCycle.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: 'OPEN',
        departmentId: data.departmentId,
        locationId: data.locationId,
        auditors: {
          connect: data.auditorIds?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        department: true,
        location: true,
        auditors: true
      }
    });
  }

  async generateAuditItems(cycleId: string, departmentId?: string, locationId?: string) {
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (locationId) where.locationId = locationId;

    const assets = await prisma.asset.findMany({ where });

    if (assets.length === 0) return 0;

    await prisma.auditItem.createMany({
      data: assets.map(a => ({
        auditCycleId: cycleId,
        assetId: a.id,
        status: 'PENDING'
      }))
    });

    return assets.length;
  }

  async updateAuditItem(itemId: string, data: any) {
    return prisma.auditItem.update({
      where: { id: itemId },
      data
    });
  }
}

export const auditRepository = new AuditRepository();
