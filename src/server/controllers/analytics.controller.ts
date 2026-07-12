import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.ts';

export class AnalyticsController {
  async getDashboard(req: Request, res: Response) {
    try {
      const data = await analyticsService.getDashboardData();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getReport(req: Request, res: Response) {
    try {
      const type = req.params.type;
      const data = await analyticsService.getReport(type);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
export const analyticsController = new AnalyticsController();
