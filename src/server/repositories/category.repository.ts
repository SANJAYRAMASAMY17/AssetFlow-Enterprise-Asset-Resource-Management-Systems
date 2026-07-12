import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class CategoryRepository {
  async findAll(query: { search?: string; page?: number; limit?: number; sortField?: string; sortOrder?: 'asc' | 'desc' } = {}) {
    const where: Prisma.AssetCategoryWhereInput = { deletedAt: null };
    
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy: any = {};
    if (query.sortField) {
      orderBy[query.sortField] = query.sortOrder || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [items, total] = await Promise.all([
      prisma.assetCategory.findMany({
        where,
        include: {
          _count: {
            select: { assets: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.assetCategory.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.assetCategory.findUnique({
      where: { id },
      include: {
        assets: true,
      },
    });
  }

  async findByName(name: string) {
    return prisma.assetCategory.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(data: Prisma.AssetCategoryUncheckedCreateInput) {
    return prisma.assetCategory.create({ data });
  }

  async update(id: string, data: Prisma.AssetCategoryUncheckedUpdateInput) {
    return prisma.assetCategory.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.assetCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}

export const categoryRepository = new CategoryRepository();
