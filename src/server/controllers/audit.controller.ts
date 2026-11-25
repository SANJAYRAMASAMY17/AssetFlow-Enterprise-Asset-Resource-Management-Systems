import { Request, Response } from 'express';
import { auditService } from '../services/audit.service.ts';

export class AuditController {
  async getAll(req: Request, res: Response) {
    try {
      const cycles = await auditService.getCycles(req.query);
      res.json(cycles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const cycle = await auditService.getCycleById(req.params.id);
      res.json(cycle);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const creatorId = (req as any).user.userId;
      const cycle = await auditService.createCycle(req.body, creatorId);
      res.status(201).json(cycle);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyItem(req: Request, res: Response) {
    try {
      const auditorId = (req as any).user.userId;
      const item = await auditService.verifyItem(req.params.itemId, req.body, auditorId);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async close(req: Request, res: Response) {
    try {
      const closerId = (req as any).user.userId;
      const cycle = await auditService.closeCycle(req.params.id, closerId);
      res.json(cycle);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const auditController = new AuditController();
