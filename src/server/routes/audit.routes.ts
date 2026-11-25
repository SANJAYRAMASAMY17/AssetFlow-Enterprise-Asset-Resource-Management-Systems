import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(requireAuth);

router.get('/', auditController.getAll.bind(auditController));
router.get('/:id', auditController.getById.bind(auditController));
router.post('/', requireAdmin, auditController.create.bind(auditController));
router.post('/items/:itemId/verify', auditController.verifyItem.bind(auditController));
router.post('/:id/close', requireAdmin, auditController.close.bind(auditController));

export default router;
