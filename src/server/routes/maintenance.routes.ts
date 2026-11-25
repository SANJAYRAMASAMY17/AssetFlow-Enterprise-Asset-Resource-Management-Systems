import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(requireAuth);

router.get('/', maintenanceController.getAll.bind(maintenanceController));
router.get('/:id', maintenanceController.getById.bind(maintenanceController));
router.post('/', maintenanceController.create.bind(maintenanceController));
router.post('/:id/approve', requireAdmin, maintenanceController.approve.bind(maintenanceController));
router.post('/:id/reject', requireAdmin, maintenanceController.reject.bind(maintenanceController));
router.post('/:id/assign', requireAdmin, maintenanceController.assignTechnician.bind(maintenanceController));
router.post('/:id/start', maintenanceController.start.bind(maintenanceController));
router.post('/:id/resolve', maintenanceController.resolve.bind(maintenanceController));
router.post('/:id/close', requireAdmin, maintenanceController.close.bind(maintenanceController));

export default router;
