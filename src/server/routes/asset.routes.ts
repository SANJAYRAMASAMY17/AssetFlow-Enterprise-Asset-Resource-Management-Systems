import { Router } from 'express';
import { assetController } from '../controllers/asset.controller.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(requireAuth);

router.get('/', assetController.getAll.bind(assetController));
router.get('/:id', assetController.getById.bind(assetController));
router.get('/:id/qrcode', assetController.generateQR.bind(assetController));
router.post('/', assetController.create.bind(assetController));
router.put('/:id', assetController.update.bind(assetController));
router.delete('/:id', assetController.delete.bind(assetController));

export default router;
