import { Router } from 'express';
import { prisma } from '../database/prisma.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const items = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ items, total: items.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
