import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class TransferRepository {
  async findAll(query: {
    assetId?: string;
    requesterId?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.TransferRequestWhereInput = {};
    
    if (query.assetId) where.assetId = query.assetId;
    if (query.requesterId) where.requesterId = query.requesterId;
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.transferRequest.findMany({
        where,
        include: {
          asset: { select: { id: true, name: true, assetTag: true } },
          requester: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transferRequest.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.transferRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        requester: true,
        approver: true,
      }
    });
  }

  async create(data: Prisma.TransferRequestUncheckedCreateInput) {
    return prisma.transferRequest.create({
      data,
      include: { asset: true, requester: true }
    });
  }

  async update(id: string, data: Prisma.TransferRequestUncheckedUpdateInput) {
    return prisma.transferRequest.update({
      where: { id },
      data,
      include: { asset: true, requester: true, approver: true }
    });
  }
}

export const transferRepository = new TransferRepository();
