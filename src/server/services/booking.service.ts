import { bookingRepository } from '../repositories/booking.repository.ts';
import { prisma } from '../database/prisma.ts';

export class BookingService {
  async getBookings(query: any) {
    return bookingRepository.findAll({
      assetId: query.assetId,
      userId: query.userId,
      status: query.status,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
  }

  async getBookingById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  async createBooking(data: { assetId: string; userId: string; startTime: string; endTime: string; purpose?: string }) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset || !asset.isShared) {
      throw new Error('Asset not found or is not a shared resource');
    }

    const hasOverlap = await bookingRepository.checkOverlap(data.assetId, startTime, endTime);
    if (hasOverlap) {
      throw new Error('Overlapping booking exists for this resource');
    }

    return prisma.$transaction(async (tx) => {
      const booking = await tx.resourceBooking.create({
        data: {
          assetId: data.assetId,
          userId: data.userId,
          startTime,
          endTime,
          purpose: data.purpose
        },
        include: { asset: true, user: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'BOOKING_CREATED',
          entityType: 'ASSET',
          entityId: data.assetId,
          userId: data.userId,
          details: `Booking created for ${startTime.toISOString()} to ${endTime.toISOString()}`
        }
      });
      
      await tx.notification.create({
        data: {
          userId: data.userId,
          title: 'Booking Request Submitted',
          message: `Your booking request for ${asset.name} has been submitted.`
        }
      });

      return booking;
    });
  }

  async approveBooking(id: string, approverId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.resourceBooking.findUnique({ where: { id }, include: { asset: true } });
      if (!booking) throw new Error('Booking not found');
      if (booking.status !== 'PENDING') throw new Error('Booking is not pending');

      const updated = await tx.resourceBooking.update({
        where: { id },
        data: { status: 'APPROVED', approverId },
        include: { asset: true, user: true, approver: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'BOOKING_APPROVED',
          entityType: 'ASSET',
          entityId: booking.assetId,
          userId: approverId,
          details: `Booking ${id} approved`
        }
      });

      await tx.notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Approved',
          message: `Your booking for ${booking.asset.name} has been approved.`
        }
      });

      return updated;
    });
  }

  async rejectBooking(id: string, approverId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.resourceBooking.findUnique({ where: { id }, include: { asset: true } });
      if (!booking) throw new Error('Booking not found');
      if (booking.status !== 'PENDING') throw new Error('Booking is not pending');

      const updated = await tx.resourceBooking.update({
        where: { id },
        data: { status: 'REJECTED', approverId },
        include: { asset: true, user: true, approver: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'BOOKING_REJECTED',
          entityType: 'ASSET',
          entityId: booking.assetId,
          userId: approverId,
          details: `Booking ${id} rejected`
        }
      });

      await tx.notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Rejected',
          message: `Your booking for ${booking.asset.name} was rejected.`
        }
      });

      return updated;
    });
  }

  async cancelBooking(id: string, userId: string, userRole: string = 'EMPLOYEE') {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.resourceBooking.findUnique({ where: { id }, include: { asset: true } });
      if (!booking) throw new Error('Booking not found');
      if (userRole === 'EMPLOYEE' && booking.userId !== userId) throw new Error('Forbidden. Cannot cancel other users\' bookings.');
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED' || booking.status === 'REJECTED') {
        throw new Error('Booking cannot be cancelled in its current state');
      }

      const updated = await tx.resourceBooking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { asset: true, user: true, approver: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'BOOKING_CANCELLED',
          entityType: 'ASSET',
          entityId: booking.assetId,
          userId,
          details: `Booking ${id} cancelled`
        }
      });

      await tx.notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Cancelled',
          message: `Booking for ${booking.asset.name} was cancelled.`
        }
      });

      return updated;
    });
  }

  async rescheduleBooking(id: string, data: { startTime: string; endTime: string }, userId: string) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    return prisma.$transaction(async (tx) => {
      const booking = await tx.resourceBooking.findUnique({ where: { id }, include: { asset: true } });
      if (!booking) throw new Error('Booking not found');
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED' || booking.status === 'REJECTED') {
        throw new Error('Booking cannot be rescheduled in its current state');
      }

      const hasOverlap = await bookingRepository.checkOverlap(booking.assetId, startTime, endTime, id);
      if (hasOverlap) {
        throw new Error('Overlapping booking exists for the new time');
      }

      const updated = await tx.resourceBooking.update({
        where: { id },
        data: { startTime, endTime, status: 'PENDING', approverId: null }, // Return to pending for approval
        include: { asset: true, user: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'BOOKING_RESCHEDULED',
          entityType: 'ASSET',
          entityId: booking.assetId,
          userId,
          details: `Booking ${id} rescheduled to ${startTime.toISOString()} - ${endTime.toISOString()}`
        }
      });

      return updated;
    });
  }
}

export const bookingService = new BookingService();
