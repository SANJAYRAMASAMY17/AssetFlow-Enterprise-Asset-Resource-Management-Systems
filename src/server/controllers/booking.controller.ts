import { Request, Response } from 'express';
import { bookingService } from '../services/booking.service.ts';

export class BookingController {
  async getAll(req: Request, res: Response) {
    try {
      const bookings = await bookingService.getBookings(req.query);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      console.log('GET BOOKING BY ID:', req.params.id);
      const booking = await bookingService.getBookingById(req.params.id);
      res.json(booking);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const booking = await bookingService.createBooking({
        ...req.body,
        userId
      });
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approve(req: Request, res: Response) {
    try {
      const approverId = (req as any).user.userId;
      const booking = await bookingService.approveBooking(req.params.id, approverId);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const approverId = (req as any).user.userId;
      const booking = await bookingService.rejectBooking(req.params.id, approverId);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const booking = await bookingService.cancelBooking(req.params.id, user.userId, user.role);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async reschedule(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const booking = await bookingService.rescheduleBooking(req.params.id, req.body, userId);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const bookingController = new BookingController();
