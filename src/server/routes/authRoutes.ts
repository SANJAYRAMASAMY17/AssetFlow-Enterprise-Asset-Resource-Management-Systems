import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';
import { z } from 'zod';

const router = Router();

const validate = (schema: any) => (req: any, res: any, next: any) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.get('/me', requireAuth, authController.me.bind(authController));

export default router;
