import { Request, Response } from 'express';
import { allocationService } from '../services/allocation.service.ts';

export class AllocationController {
  async getAll(req: Request, res: Response) {
    try {
      const allocations = await allocationService.getAllocations(req.query);
      res.json(allocations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const allocation = await allocationService.getAllocationById(req.params.id);
      res.json(allocation);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getOverdue(req: Request, res: Response) {
    try {
      const allocations = await allocationService.getOverdueAllocations();
      res.json(allocations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async assign(req: Request, res: Response) {
    try {
      // req.user should be available from requireAuth
      const assignedBy = (req as any).user.userId;
      const allocation = await allocationService.assignAsset({
        ...req.body,
        assignedBy
      });
      res.status(201).json(allocation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async returnAsset(req: Request, res: Response) {
    try {
      const returnedBy = (req as any).user.userId;
      const result = await allocationService.returnAsset(req.params.id, {
        ...req.body,
        returnedBy
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const allocationController = new AllocationController();
