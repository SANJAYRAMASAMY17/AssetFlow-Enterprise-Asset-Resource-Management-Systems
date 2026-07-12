import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', analyticsController.getDashboard.bind(analyticsController));
router.get('/reports/:type', analyticsController.getReport.bind(analyticsController));

export default router;
