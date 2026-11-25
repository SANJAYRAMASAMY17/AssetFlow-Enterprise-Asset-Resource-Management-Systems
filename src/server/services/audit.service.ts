import { auditRepository } from '../repositories/audit.repository.ts';
import { prisma } from '../database/prisma.ts';

export class AuditService {
  async getCycles(query: any) {
    return auditRepository.findAllCycles(query);
  }

  async getCycleById(id: string) {
    const cycle = await auditRepository.findCycleById(id);
    if (!cycle) throw new Error('Audit cycle not found');
    return cycle;
  }

  async createCycle(data: any, creatorId: string) {
    return prisma.$transaction(async (tx) => {
      const cycle = await auditRepository.createCycle(data);

      await auditRepository.generateAuditItems(cycle.id, data.departmentId, data.locationId);

      await tx.activityLog.create({
        data: {
          action: 'AUDIT_CREATED',
          entityType: 'AUDIT',
          entityId: cycle.id,
          userId: creatorId,
          details: `Audit cycle ${cycle.name} created`
        }
      });

      if (data.auditorIds && data.auditorIds.length > 0) {
        for (const auditorId of data.auditorIds) {
          await tx.activityLog.create({
            data: {
              action: 'AUDITOR_ASSIGNED',
              entityType: 'AUDIT',
              entityId: cycle.id,
              userId: creatorId,
              details: `Auditor assigned to ${cycle.name}`
            }
          });
          await tx.notification.create({
            data: {
              userId: auditorId,
              title: 'Audit Assigned',
              message: `You have been assigned to audit cycle: ${cycle.name}`
            }
          });
        }
      }

      return cycle;
    });
  }

  async verifyItem(itemId: string, data: { status: any; notes?: string; photoUrl?: string }, auditorId: string) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.auditItem.findUnique({ where: { id: itemId }, include: { auditCycle: true, asset: true } });
      if (!item) throw new Error('Audit item not found');
      if (item.auditCycle.status === 'COMPLETED') throw new Error('Audit cycle is already completed');
      
      if (item.auditCycle.status === 'OPEN') {
        await tx.auditCycle.update({ where: { id: item.auditCycle.id }, data: { status: 'IN_PROGRESS' } });
      }

      const updated = await tx.auditItem.update({
        where: { id: itemId },
        data: {
          status: data.status,
          notes: data.notes,
          photoUrl: data.photoUrl,
          auditedById: auditorId,
          auditedAt: new Date()
        }
      });

      await tx.activityLog.create({
        data: {
          action: 'ASSET_VERIFIED',
          entityType: 'ASSET',
          entityId: item.assetId,
          userId: auditorId,
          details: `Asset audited in cycle ${item.auditCycle.name}: ${data.status}`
        }
      });

      return updated;
    });
  }

  async closeCycle(id: string, closerId: string) {
    return prisma.$transaction(async (tx) => {
      const cycle = await tx.auditCycle.findUnique({ where: { id }, include: { auditItems: true, auditors: true } });
      if (!cycle) throw new Error('Audit cycle not found');
      if (cycle.status === 'COMPLETED') throw new Error('Already completed');

      const pendingItems = cycle.auditItems.filter(i => i.status === 'PENDING');
      if (pendingItems.length > 0) {
        throw new Error(`Cannot close audit: ${pendingItems.length} assets are still pending verification`);
      }

      const updated = await tx.auditCycle.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });

      // Update asset statuses based on audit
      const missingItems = cycle.auditItems.filter(i => i.status === 'MISSING');
      for (const item of missingItems) {
        await tx.asset.update({ where: { id: item.assetId }, data: { status: 'LOST' } });
      }
      
      const retiredItems = cycle.auditItems.filter(i => i.status === 'RETIRED');
      for (const item of retiredItems) {
        await tx.asset.update({ where: { id: item.assetId }, data: { status: 'RETIRED' } });
      }

      await tx.activityLog.create({
        data: {
          action: 'AUDIT_CLOSED',
          entityType: 'AUDIT',
          entityId: id,
          userId: closerId,
          details: `Audit cycle ${cycle.name} closed`
        }
      });

      for (const auditor of cycle.auditors) {
        await tx.notification.create({
          data: {
            userId: auditor.id,
            title: 'Audit Completed',
            message: `Audit cycle ${cycle.name} has been closed.`
          }
        });
      }

      return updated;
    });
  }
}

export const auditService = new AuditService();
