import { Router } from 'express';
import { departmentController } from '../controllers/department.controller.ts';
import { requireAdmin } from '../middleware/auth.middleware.ts';

const router = Router();

router.get('/', departmentController.getAll.bind(departmentController));
router.get('/:id', departmentController.getById.bind(departmentController));
router.post('/', requireAdmin, departmentController.create.bind(departmentController));
router.put('/:id', requireAdmin, departmentController.update.bind(departmentController));
router.delete('/:id', requireAdmin, departmentController.deactivate.bind(departmentController));

export default router;
