import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.ts';
import { requireAuth, requireApprover } from '../middleware/auth.middleware.ts';

const router = Router();
router.use(requireAuth);

router.get('/', bookingController.getAll.bind(bookingController));
router.get('/:id', bookingController.getById.bind(bookingController));
router.post('/', bookingController.create.bind(bookingController));

router.patch('/:id/approve', requireApprover, bookingController.approve.bind(bookingController));
router.patch('/:id/reject', requireApprover, bookingController.reject.bind(bookingController));
router.patch('/:id/cancel', bookingController.cancel.bind(bookingController));
router.patch('/:id/reschedule', bookingController.reschedule.bind(bookingController));

export default router;
