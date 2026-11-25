import { Router } from 'express';
import { prisma } from '../database/prisma.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = { userId: req.user.id };
    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === 'true';
    }

    if (req.query.search) {
      query.OR = [
        { title: { contains: req.query.search as string, mode: 'insensitive' } },
        { message: { contains: req.query.search as string, mode: 'insensitive' } },
      ];
    }

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: query,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: query }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit), unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/read', async (req: any, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/read-all', async (req: any, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.deleteMany({
      where: { id, userId: req.user.id },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
