import { maintenanceRepository } from '../repositories/maintenance.repository.ts';
import { prisma } from '../database/prisma.ts';

export class MaintenanceService {
  async getRequests(query: any) {
    return maintenanceRepository.findAll(query);
  }

  async getRequestById(id: string) {
    const req = await maintenanceRepository.findById(id);
    if (!req) throw new Error('Maintenance request not found');
    return req;
  }

  async createRequest(data: { assetId: string; requesterId: string; description: string; priority: any; attachments?: string[] }) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new Error('Asset not found');
    if (asset.status !== 'ALLOCATED') throw new Error('Only allocated assets can have maintenance requests');

    const hasActive = await maintenanceRepository.hasActiveRequest(data.assetId);
    if (hasActive) throw new Error('Active maintenance request already exists for this asset');

    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.create({
        data: {
          assetId: data.assetId,
          requesterId: data.requesterId,
          description: data.description,
          priority: data.priority,
          attachments: data.attachments || []
        },
        include: { asset: true, requester: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'MAINTENANCE_REQUESTED',
          entityType: 'ASSET',
          entityId: data.assetId,
          userId: data.requesterId,
          details: `Maintenance requested: ${data.description}`
        }
      });

      await tx.notification.create({
        data: {
          userId: data.requesterId,
          title: 'Maintenance Request Submitted',
          message: `Your maintenance request for ${asset.name} has been submitted.`
        }
      });

      return request;
    });
  }

  async approveRequest(id: string, approverId: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id }, include: { asset: true } });
      if (!request) throw new Error('Maintenance request not found');
      if (request.status !== 'PENDING') throw new Error('Request is not pending');

      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: { asset: true, requester: true }
      });

      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'UNDER_MAINTENANCE' }
      });

      await tx.activityLog.create({
        data: {
          action: 'MAINTENANCE_APPROVED',
          entityType: 'ASSET',
          entityId: request.assetId,
          userId: approverId,
          details: `Maintenance request ${id} approved`
        }
      });

      await tx.notification.create({
        data: {
          userId: request.requesterId,
          title: 'Maintenance Request Approved',
          message: `Your maintenance request for ${request.asset.name} has been approved.`
        }
      });

      return updated;
    });
  }

  async rejectRequest(id: string, approverId: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id }, include: { asset: true } });
      if (!request) throw new Error('Maintenance request not found');
      if (request.status !== 'PENDING') throw new Error('Request is not pending');

      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: { asset: true, requester: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'MAINTENANCE_REJECTED',
          entityType: 'ASSET',
          entityId: request.assetId,
          userId: approverId,
          details: `Maintenance request ${id} rejected`
        }
      });

      await tx.notification.create({
        data: {
          userId: request.requesterId,
          title: 'Maintenance Request Rejected',
          message: `Your maintenance request for ${request.asset.name} was rejected.`
        }
      });

      return updated;
    });
  }

  async assignTechnician(id: string, data: { technicianId: string; estimatedCompletionDate: string; cost?: number; notes?: string }, assignerId: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id }, include: { asset: true } });
      if (!request) throw new Error('Maintenance request not found');
      if (request.status !== 'APPROVED') throw new Error('Request must be approved to assign technician');
      if (request.technicianId) throw new Error('Technician already assigned');

      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: 'TECHNICIAN_ASSIGNED',
          technicianId: data.technicianId,
          estimatedCompletionDate: new Date(data.estimatedCompletionDate),
          cost: data.cost,
          notes: data.notes
        },
        include: { asset: true, requester: true, technician: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'TECHNICIAN_ASSIGNED',
          entityType: 'ASSET',
          entityId: request.assetId,
          userId: assignerId,
          details: `Technician assigned for maintenance ${id}`
        }
      });

      return updated;
    });
  }

  async startMaintenance(id: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id }, include: { asset: true } });
      if (!request) throw new Error('Maintenance request not found');
      if (request.status !== 'TECHNICIAN_ASSIGNED') throw new Error('Technician must be assigned before starting');

      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
        include: { asset: true, requester: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'MAINTENANCE_STARTED',
          entityType: 'ASSET',
          entityId: request.assetId,
          details: `Maintenance ${id} started`
        }
      });

      await tx.notification.create({
        data: {
          userId: request.requesterId,
          title: 'Maintenance Started',
          message: `Maintenance for ${request.asset.name} has started.`
        }
      });

      return updated;
    });
  }

  async resolveMaintenance(id: string, resolution: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id }, include: { asset: true } });
      if (!request) throw new Error('Maintenance request not found');
      if (request.status !== 'IN_PROGRESS') throw new Error('Maintenance must be in progress to resolve');

      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'RESOLVED', resolution, resolvedAt: new Date() },
        include: { asset: true, requester: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'MAINTENANCE_RESOLVED',
          entityType: 'ASSET',
          entityId: request.assetId,
          details: `Maintenance ${id} resolved`
        }
      });

      return updated;
    });
  }

  async closeMaintenance(id: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id }, include: { asset: true } });
      if (!request) throw new Error('Maintenance request not found');
      if (request.status !== 'RESOLVED') throw new Error('Maintenance must be resolved to close');
      if (!request.technicianId) throw new Error('Cannot close maintenance before technician assignment');

      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'CLOSED', completedAt: new Date() },
        include: { asset: true, requester: true }
      });

      // Check if there is an active allocation for this asset
      const activeAllocation = await tx.assetAllocation.findFirst({
        where: {
          assetId: request.assetId,
          returnedAt: null
        }
      });

      const newAssetStatus = activeAllocation ? 'ALLOCATED' : 'AVAILABLE';

      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: newAssetStatus }
      });

      await tx.activityLog.create({
        data: {
          action: 'MAINTENANCE_CLOSED',
          entityType: 'ASSET',
          entityId: request.assetId,
          details: `Maintenance ${id} closed. Asset status updated to ${newAssetStatus}`
        }
      });

      await tx.notification.create({
        data: {
          userId: request.requesterId,
          title: 'Maintenance Completed',
          message: `Maintenance for ${request.asset.name} has been completed and closed.`
        }
      });

      return updated;
    });
  }
}

export const maintenanceService = new MaintenanceService();
