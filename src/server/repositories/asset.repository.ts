import { Prisma, AssetStatus } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class AssetRepository {
  async findAll(query: { 
    search?: string; 
    categoryId?: string;
    departmentId?: string;
    condition?: string;
    status?: AssetStatus;
    isShared?: boolean;
    page?: number; 
    limit?: number;
    sortBy?: string;
  }) {
    const where: Prisma.AssetWhereInput = { deletedAt: null };
    
    if (query.search) {
      where.OR = [
        { assetTag: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
        { vendor: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.condition) where.condition = query.condition;
    if (query.status) where.status = query.status;
    if (query.isShared !== undefined) where.isShared = query.isShared;

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    let orderBy: Prisma.AssetOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (query.sortBy === 'name') orderBy = { name: 'asc' };
    else if (query.sortBy === 'purchaseCost') orderBy = { purchaseCost: 'desc' };

    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.asset.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
        location: true,
        allocations: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { allocatedAt: 'desc' },
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
        },
        transferRequests: {
          include: {
            requester: { select: { id: true, name: true } },
            approver: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }
      },
    });
  }

  async findByTag(assetTag: string) {
    return prisma.asset.findUnique({ where: { assetTag } });
  }

  async findBySerialNumber(serialNumber: string) {
    return prisma.asset.findUnique({ where: { serialNumber } });
  }

  async count() {
    return prisma.asset.count();
  }

  async create(data: Prisma.AssetUncheckedCreateInput) {
    return prisma.asset.create({ data });
  }

  async update(id: string, data: Prisma.AssetUncheckedUpdateInput) {
    return prisma.asset.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const assetRepository = new AssetRepository();
