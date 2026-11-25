import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class MaintenanceRepository {
  async findAll(query: any) {
    const where: Prisma.MaintenanceRequestWhereInput = {};
    if (query.assetId) where.assetId = query.assetId;
    if (query.requesterId) where.requesterId = query.requesterId;
    if (query.status) where.status = query.status;
    if (query.technicianId) where.technicianId = query.technicianId;

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          asset: { select: { id: true, name: true, assetTag: true, status: true } },
          requester: { select: { id: true, name: true, email: true } },
          technician: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.maintenanceRequest.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        requester: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async hasActiveRequest(assetId: string) {
    const active = await prisma.maintenanceRequest.findFirst({
      where: {
        assetId,
        status: { notIn: ['CLOSED', 'REJECTED'] }
      }
    });
    return !!active;
  }
}
export const maintenanceRepository = new MaintenanceRepository();
