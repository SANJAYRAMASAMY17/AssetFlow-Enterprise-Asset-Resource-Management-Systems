import { Request, Response } from 'express';
import { assetService } from '../services/asset.service.ts';
import QRCode from 'qrcode';

export class AssetController {
  async getAll(req: Request, res: Response) {
    try {
      const assets = await assetService.getAssets(req.query);
      res.json(assets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      res.json(asset);
    } catch (error: any) {
      if (error.message === 'Asset not found') res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const asset = await assetService.createAsset(req.body);
      res.status(201).json(asset);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const asset = await assetService.updateAsset(req.params.id, req.body);
      res.json(asset);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await assetService.deleteAsset(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'Asset not found') res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  async generateQR(req: Request, res: Response) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      const data = JSON.stringify({ id: asset.id, assetTag: asset.assetTag });
      const qrDataUrl = await QRCode.toDataURL(data);
      res.json({ qrCode: qrDataUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const assetController = new AssetController();
