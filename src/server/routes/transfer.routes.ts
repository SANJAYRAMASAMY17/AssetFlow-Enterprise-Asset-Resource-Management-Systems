import { Router } from 'express';
import { transferController } from '../controllers/transfer.controller.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(requireAuth);

router.get('/', transferController.getAll.bind(transferController));
router.post('/', transferController.create.bind(transferController));
router.post('/:id/approve', requireAdmin, transferController.approve.bind(transferController));
router.post('/:id/reject', requireAdmin, transferController.reject.bind(transferController));

export default router;
