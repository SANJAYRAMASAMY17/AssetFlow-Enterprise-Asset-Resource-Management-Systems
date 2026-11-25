import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class DepartmentRepository {
  async findAll(query: { search?: string; page?: number; limit?: number; sortField?: string; sortOrder?: 'asc' | 'desc' } = {}) {
    const where: Prisma.DepartmentWhereInput = { deletedAt: null };
    
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
      prisma.department.findMany({
        where,
        include: {
          parent: true,
          head: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { users: true, children: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.department.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        parent: true,
        head: {
          select: { id: true, name: true, email: true },
        },
        users: {
          select: { id: true, name: true, email: true, role: true, isActive: true },
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.department.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(data: Prisma.DepartmentUncheckedCreateInput) {
    return prisma.department.create({ data });
  }

  async update(id: string, data: Prisma.DepartmentUncheckedUpdateInput) {
    return prisma.department.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.department.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}

export const departmentRepository = new DepartmentRepository();
