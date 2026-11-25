import { Prisma, Role } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class EmployeeRepository {
  async findAll(query: { search?: string; departmentId?: string; role?: Role; isActive?: boolean; page?: number; limit?: number }) {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true, isActive: true, createdAt: true,
          department: { select: { id: true, name: true } },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true, isActive: true, createdAt: true, departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: Prisma.UserUncheckedUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true, departmentId: true },
    });
  }
}

export const employeeRepository = new EmployeeRepository();
