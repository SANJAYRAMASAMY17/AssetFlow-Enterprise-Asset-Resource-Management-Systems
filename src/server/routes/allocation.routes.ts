import { Router } from 'express';
import { allocationController } from '../controllers/allocation.controller.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(requireAuth);

router.get('/', allocationController.getAll.bind(allocationController));
router.get('/overdue', allocationController.getOverdue.bind(allocationController));
router.get('/:id', allocationController.getById.bind(allocationController));
router.post('/', requireAdmin, allocationController.assign.bind(allocationController)); // usually admin/asset_manager can assign
router.post('/:id/return', allocationController.returnAsset.bind(allocationController));

export default router;
