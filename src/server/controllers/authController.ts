import { Request, Response } from 'express';
import { authService } from '../services/authService.ts';
import { userRepository } from '../repositories/userRepository.ts';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async me(req: Request, res: Response) {
    try {
      const authReq = req as any;
      if (!authReq.user || !authReq.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await userRepository.findById(authReq.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();
