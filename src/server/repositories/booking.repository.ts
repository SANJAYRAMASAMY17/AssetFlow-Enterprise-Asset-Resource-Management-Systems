import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.ts';

export class BookingRepository {
  async findAll(query: {
    assetId?: string;
    userId?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.ResourceBookingWhereInput = {};
    
    if (query.assetId) where.assetId = query.assetId;
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    if (query.startDate && query.endDate) {
      where.OR = [
        { startTime: { lte: query.endDate }, endTime: { gte: query.startDate } }
      ];
    } else if (query.startDate) {
      where.startTime = { gte: query.startDate };
    } else if (query.endDate) {
      where.endTime = { lte: query.endDate };
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.resourceBooking.findMany({
        where,
        include: {
          asset: { select: { id: true, name: true, assetTag: true, isShared: true } },
          user: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } }
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.resourceBooking.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.resourceBooking.findUnique({
      where: { id },
      include: {
        asset: true,
        user: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async checkOverlap(assetId: string, startTime: Date, endTime: Date, excludeBookingId?: string) {
    const where: Prisma.ResourceBookingWhereInput = {
      assetId,
      status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    };

    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }

    const overlap = await prisma.resourceBooking.findFirst({
      where
    });

    return !!overlap;
  }

  async create(data: Prisma.ResourceBookingUncheckedCreateInput) {
    return prisma.resourceBooking.create({
      data,
      include: { asset: true, user: true }
    });
  }

  async update(id: string, data: Prisma.ResourceBookingUncheckedUpdateInput) {
    return prisma.resourceBooking.update({
      where: { id },
      data,
      include: { asset: true, user: true, approver: true }
    });
  }
}

export const bookingRepository = new BookingRepository();
