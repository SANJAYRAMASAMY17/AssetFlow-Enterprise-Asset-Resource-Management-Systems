import { assetRepository } from '../repositories/asset.repository.ts';
import { AssetStatus } from '@prisma/client';

export class AssetService {
  async getAssets(query: any) {
    const typedQuery = {
      search: query.search,
      categoryId: query.categoryId,
      departmentId: query.departmentId,
      condition: query.condition,
      status: query.status as AssetStatus,
      isShared: query.isShared !== undefined ? query.isShared === 'true' : undefined,
      sortBy: query.sortBy,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };
    return assetRepository.findAll(typedQuery);
  }

  async getAssetById(id: string) {
    const asset = await assetRepository.findById(id);
    if (!asset || asset.deletedAt) throw new Error('Asset not found');
    return asset;
  }

  async generateAssetTag() {
    const count = await assetRepository.count();
    const nextId = count + 1;
    return `AF-${nextId.toString().padStart(6, '0')}`;
  }

  async createAsset(data: any) {
    // Unique serial number check
    if (data.serialNumber) {
      const existingSerial = await assetRepository.findBySerialNumber(data.serialNumber);
      if (existingSerial) {
        throw new Error('Serial number must be unique');
      }
    }

    // Auto-generate tag if not provided
    if (!data.assetTag) {
      data.assetTag = await this.generateAssetTag();
    } else {
      const existingTag = await assetRepository.findByTag(data.assetTag);
      if (existingTag) {
        throw new Error('Asset tag must be unique');
      }
    }

    // Dates validation
    if (data.purchaseDate && new Date(data.purchaseDate) > new Date()) {
      throw new Error('Purchase date cannot be in the future');
    }
    if (data.warrantyExpiry && data.purchaseDate && new Date(data.warrantyExpiry) <= new Date(data.purchaseDate)) {
      throw new Error('Warranty expiry must be after purchase date');
    }
    if (data.purchaseCost && data.purchaseCost < 0) {
      throw new Error('Purchase cost must be non-negative');
    }

    return assetRepository.create({
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      purchaseCost: data.purchaseCost ? parseFloat(data.purchaseCost) : null,
    });
  }

  async updateAsset(id: string, data: any) {
    const existing = await this.getAssetById(id);

    if (data.serialNumber && data.serialNumber !== existing.serialNumber) {
      const serialConflict = await assetRepository.findBySerialNumber(data.serialNumber);
      if (serialConflict && serialConflict.id !== id) {
        throw new Error('Serial number must be unique');
      }
    }

    if (data.assetTag && data.assetTag !== existing.assetTag) {
      const tagConflict = await assetRepository.findByTag(data.assetTag);
      if (tagConflict && tagConflict.id !== id) {
        throw new Error('Asset tag must be unique');
      }
    }

    // Dates validation
    const pDate = data.purchaseDate !== undefined ? (data.purchaseDate ? new Date(data.purchaseDate) : null) : existing.purchaseDate;
    const wDate = data.warrantyExpiry !== undefined ? (data.warrantyExpiry ? new Date(data.warrantyExpiry) : null) : existing.warrantyExpiry;

    if (pDate && pDate > new Date()) {
      throw new Error('Purchase date cannot be in the future');
    }
    if (wDate && pDate && wDate <= pDate) {
      throw new Error('Warranty expiry must be after purchase date');
    }
    if (data.purchaseCost !== undefined && data.purchaseCost < 0) {
      throw new Error('Purchase cost must be non-negative');
    }

    const updateData = { ...data };
    if (updateData.purchaseDate !== undefined) updateData.purchaseDate = pDate;
    if (updateData.warrantyExpiry !== undefined) updateData.warrantyExpiry = wDate;
    if (updateData.purchaseCost !== undefined) updateData.purchaseCost = parseFloat(updateData.purchaseCost);

    return assetRepository.update(id, updateData);
  }

  async deleteAsset(id: string) {
    const asset = await this.getAssetById(id);
    if (!asset) throw new Error('Asset not found');
    return assetRepository.softDelete(id);
  }
}

export const assetService = new AssetService();
