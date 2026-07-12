import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller.ts';
import { requireAdmin } from '../middleware/auth.middleware.ts';

const router = Router();

router.get('/', employeeController.getAll.bind(employeeController));
router.get('/:id', employeeController.getById.bind(employeeController));
router.put('/:id/promote', requireAdmin, employeeController.promote.bind(employeeController));
router.put('/:id/department', requireAdmin, employeeController.assignDepartment.bind(employeeController));
router.put('/:id/deactivate', requireAdmin, employeeController.deactivate.bind(employeeController));
router.put('/:id/reactivate', requireAdmin, employeeController.reactivate.bind(employeeController));

export default router;
