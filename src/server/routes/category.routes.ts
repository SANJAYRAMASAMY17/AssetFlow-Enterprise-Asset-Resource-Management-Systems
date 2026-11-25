import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.ts';
import { requireAdmin } from '../middleware/auth.middleware.ts';

const router = Router();

router.get('/', categoryController.getAll.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));
router.post('/', requireAdmin, categoryController.create.bind(categoryController));
router.put('/:id', requireAdmin, categoryController.update.bind(categoryController));
router.delete('/:id', requireAdmin, categoryController.deactivate.bind(categoryController));

export default router;
