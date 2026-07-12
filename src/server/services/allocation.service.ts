import { allocationRepository } from '../repositories/allocation.repository.ts';
import { assetRepository } from '../repositories/asset.repository.ts';
import { prisma } from '../database/prisma.ts';

export class AllocationService {
  async getAllocations(query: any) {
    return allocationRepository.findAll({
      assetId: query.assetId,
      userId: query.userId,
      status: query.status,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
  }

  async getAllocationById(id: string) {
    const alloc = await allocationRepository.findById(id);
    if (!alloc) throw new Error('Allocation not found');
    return alloc;
  }

  async getOverdueAllocations() {
    return allocationRepository.findAll({
      status: 'OVERDUE',
      limit: 100 // Should ideally handle pagination, keeping simple
    });
  }

  async assignAsset(data: { assetId: string; userId: string; expectedReturnDate?: string; notes?: string; assignedBy: string }) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new Error('Asset not found');
      if (asset.status !== 'AVAILABLE') throw new Error('Asset is not available for allocation');

      // Create allocation
      const allocation = await tx.assetAllocation.create({
        data: {
          assetId: data.assetId,
          userId: data.userId,
          expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
          notes: data.notes,
        },
        include: { asset: true, user: true }
      });

      // Update asset status
      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: 'ALLOCATED' }
      });

      // Record activity
      await tx.activityLog.create({
        data: {
          action: 'ALLOCATED',
          entityType: 'ASSET',
          entityId: data.assetId,
          userId: data.assignedBy,
          details: `Allocated to user ${data.userId}`
        }
      });

      return allocation;
    });
  }

  async returnAsset(allocationId: string, data: { condition?: string; remarks?: string; returnedBy: string }) {
    return prisma.$transaction(async (tx) => {
      const allocation = await tx.assetAllocation.findUnique({ 
        where: { id: allocationId },
        include: { asset: true }
      });
      if (!allocation) throw new Error('Allocation not found');
      if (allocation.returnedAt) throw new Error('Asset already returned');

      // Update allocation
      const updatedAllocation = await tx.assetAllocation.update({
        where: { id: allocationId },
        data: {
          returnedAt: new Date(),
          notes: data.remarks ? `${allocation.notes ? allocation.notes + '\n' : ''}Return Remarks: ${data.remarks}` : allocation.notes,
        },
        include: { asset: true, user: true }
      });

      // Update asset status and condition
      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { 
          status: 'AVAILABLE',
          condition: data.condition || allocation.asset.condition
        }
      });

      // Record activity
      await tx.activityLog.create({
        data: {
          action: 'RETURNED',
          entityType: 'ASSET',
          entityId: allocation.assetId,
          userId: data.returnedBy,
          details: `Returned from allocation ${allocationId}`
        }
      });

      return updatedAllocation;
    });
  }
}

export const allocationService = new AllocationService();
