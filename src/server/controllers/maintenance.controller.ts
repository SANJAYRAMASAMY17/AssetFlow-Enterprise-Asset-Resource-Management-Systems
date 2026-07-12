import { Request, Response } from 'express';
import { maintenanceService } from '../services/maintenance.service.ts';

export class MaintenanceController {
  async getAll(req: Request, res: Response) {
    try {
      const requests = await maintenanceService.getRequests(req.query);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const request = await maintenanceService.getRequestById(req.params.id);
      res.json(request);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const requesterId = (req as any).user.userId;
      const request = await maintenanceService.createRequest({
        ...req.body,
        requesterId
      });
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approve(req: Request, res: Response) {
    try {
      const approverId = (req as any).user.userId;
      const request = await maintenanceService.approveRequest(req.params.id, approverId);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const approverId = (req as any).user.userId;
      const request = await maintenanceService.rejectRequest(req.params.id, approverId);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async assignTechnician(req: Request, res: Response) {
    try {
      const assignerId = (req as any).user.userId;
      const request = await maintenanceService.assignTechnician(req.params.id, req.body, assignerId);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async start(req: Request, res: Response) {
    try {
      const request = await maintenanceService.startMaintenance(req.params.id);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async resolve(req: Request, res: Response) {
    try {
      const request = await maintenanceService.resolveMaintenance(req.params.id, req.body.resolution);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async close(req: Request, res: Response) {
    try {
      const request = await maintenanceService.closeMaintenance(req.params.id);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const maintenanceController = new MaintenanceController();
