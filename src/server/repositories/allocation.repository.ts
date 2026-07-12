import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class AllocationRepository {
  async findAll(query: {
    assetId?: string;
    userId?: string;
    status?: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.AssetAllocationWhereInput = {};
    
    if (query.assetId) where.assetId = query.assetId;
    if (query.userId) where.userId = query.userId;
    
    if (query.status === 'ACTIVE') {
      where.returnedAt = null;
    } else if (query.status === 'RETURNED') {
      where.returnedAt = { not: null };
    } else if (query.status === 'OVERDUE') {
      where.returnedAt = null;
      where.expectedReturnDate = { lt: new Date() };
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.assetAllocation.findMany({
        where,
        include: {
          asset: { select: { id: true, name: true, assetTag: true, status: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { allocatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.assetAllocation.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.assetAllocation.findUnique({
      where: { id },
      include: {
        asset: true,
        user: true,
      }
    });
  }

  async create(data: Prisma.AssetAllocationUncheckedCreateInput) {
    return prisma.assetAllocation.create({
      data,
      include: { asset: true, user: true }
    });
  }

  async update(id: string, data: Prisma.AssetAllocationUncheckedUpdateInput) {
    return prisma.assetAllocation.update({
      where: { id },
      data,
      include: { asset: true, user: true }
    });
  }
}

export const allocationRepository = new AllocationRepository();
