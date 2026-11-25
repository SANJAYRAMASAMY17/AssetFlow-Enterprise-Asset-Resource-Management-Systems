import { transferRepository } from '../repositories/transfer.repository.ts';
import { prisma } from '../database/prisma.ts';

export class TransferService {
  async getTransfers(query: any) {
    return transferRepository.findAll({
      assetId: query.assetId,
      requesterId: query.requesterId,
      status: query.status,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
  }

  async createTransferRequest(data: { assetId: string; requesterId: string; reason?: string }) {
    // Check if asset is already requested
    const existing = await prisma.transferRequest.findFirst({
      where: {
        assetId: data.assetId,
        status: 'PENDING'
      }
    });

    if (existing) {
      throw new Error('A transfer request is already pending for this asset');
    }

    return prisma.$transaction(async (tx) => {
      const req = await tx.transferRequest.create({
        data: {
          assetId: data.assetId,
          requesterId: data.requesterId,
          reason: data.reason
        },
        include: { asset: true, requester: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'TRANSFER_REQUESTED',
          entityType: 'ASSET',
          entityId: data.assetId,
          userId: data.requesterId,
          details: `Requested transfer`
        }
      });

      return req;
    });
  }

  async approveTransfer(id: string, approverId: string) {
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.transferRequest.findUnique({ 
        where: { id },
        include: { asset: { include: { allocations: { where: { returnedAt: null } } } } }
      });
      if (!transfer) throw new Error('Transfer request not found');
      if (transfer.status !== 'PENDING') throw new Error('Transfer is not pending');

      // Update transfer status
      const updatedTransfer = await tx.transferRequest.update({
        where: { id },
        data: { status: 'APPROVED', approverId },
        include: { asset: true, requester: true, approver: true }
      });

      // Terminate existing allocation if any
      if (transfer.asset.allocations.length > 0) {
        for (const alloc of transfer.asset.allocations) {
          await tx.assetAllocation.update({
            where: { id: alloc.id },
            data: { returnedAt: new Date(), notes: 'Returned due to asset transfer' }
          });
        }
      }

      // Create new allocation
      await tx.assetAllocation.create({
        data: {
          assetId: transfer.assetId,
          userId: transfer.requesterId,
        }
      });

      // Ensure asset is marked as ALLOCATED
      await tx.asset.update({
        where: { id: transfer.assetId },
        data: { status: 'ALLOCATED' }
      });

      await tx.activityLog.create({
        data: {
          action: 'TRANSFER_APPROVED',
          entityType: 'ASSET',
          entityId: transfer.assetId,
          userId: approverId,
          details: `Approved transfer request ${id}`
        }
      });

      return updatedTransfer;
    });
  }

  async rejectTransfer(id: string, approverId: string) {
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.transferRequest.findUnique({ where: { id } });
      if (!transfer) throw new Error('Transfer request not found');
      if (transfer.status !== 'PENDING') throw new Error('Transfer is not pending');

      const updatedTransfer = await tx.transferRequest.update({
        where: { id },
        data: { status: 'REJECTED', approverId },
        include: { asset: true, requester: true, approver: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'TRANSFER_REJECTED',
          entityType: 'ASSET',
          entityId: transfer.assetId,
          userId: approverId,
          details: `Rejected transfer request ${id}`
        }
      });

      return updatedTransfer;
    });
  }
}

export const transferService = new TransferService();
