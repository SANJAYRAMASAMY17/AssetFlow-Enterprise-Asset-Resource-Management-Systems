import { Request, Response } from 'express';
import { transferService } from '../services/transfer.service.ts';

export class TransferController {
  async getAll(req: Request, res: Response) {
    try {
      const transfers = await transferService.getTransfers(req.query);
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const requesterId = (req as any).user.userId;
      const transfer = await transferService.createTransferRequest({
        ...req.body,
        requesterId
      });
      res.status(201).json(transfer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approve(req: Request, res: Response) {
    try {
      const approverId = (req as any).user.userId;
      const transfer = await transferService.approveTransfer(req.params.id, approverId);
      res.json(transfer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const approverId = (req as any).user.userId;
      const transfer = await transferService.rejectTransfer(req.params.id, approverId);
      res.json(transfer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const transferController = new TransferController();
