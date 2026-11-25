import { Router } from 'express';
import { prisma } from '../database/prisma.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: req.query.entityType ? { entityType: req.query.entityType as string } : {},
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({
        where: req.query.entityType ? { entityType: req.query.entityType as string } : {}
      })
    ]);
    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
