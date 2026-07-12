import { prisma } from '../database/prisma.ts';

export const startBackgroundJobs = () => {
  // Run once an hour
  setInterval(async () => {
    try {
      console.log('Running background jobs...');
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 1. Booking Reminder
      const upcomingBookings = await prisma.resourceBooking.findMany({
        where: {
          startTime: {
            gte: today,
            lte: tomorrow
          },
          status: 'APPROVED'
        }
      });
      
      for (const booking of upcomingBookings) {
        await createNotification(booking.userId, 'Booking Reminder', `You have an upcoming booking tomorrow.`);
      }

      // 2. Overdue Asset Reminder
      const overdueAllocations = await prisma.assetAllocation.findMany({
        where: {
          expectedReturnDate: {
            lt: today
          },
          returnedAt: null
        },
        include: {
          asset: true
        }
      });

      for (const allocation of overdueAllocations) {
        await createNotification(allocation.userId, 'Overdue Asset', `Please return ${allocation.asset.name}. It is overdue.`);
      }

      // 3. Maintenance Reminder
      const maintenance = await prisma.maintenanceRequest.findMany({
        where: {
          status: 'IN_PROGRESS'
        }
      });

      for (const req of maintenance) {
        if (req.technicianId) {
            await createNotification(req.technicianId, 'Maintenance Reminder', `You have an active maintenance task in progress.`);
        }
      }
      
      // 4. Audit Reminder
      const audits = await prisma.auditCycle.findMany({
        where: {
          status: 'IN_PROGRESS'
        },
        include: {
            auditors: true
        }
      });

      for (const audit of audits) {
          for (const auditor of audit.auditors) {
            await createNotification(auditor.id, 'Audit Reminder', `Audit cycle "${audit.name}" is in progress.`);
          }
      }

    } catch (err) {
      console.error('Background jobs error:', err);
    }
  }, 1000 * 60 * 60); // every 1 hour
};

async function createNotification(userId: string, title: string, message: string) {
  // Simple check to avoid spamming the same notification
  const existing = await prisma.notification.findFirst({
      where: {
          userId,
          title,
          createdAt: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 23) // last 23 hours
          }
      }
  });

  if (!existing) {
      await prisma.notification.create({
          data: {
              userId,
              title,
              message
          }
      });
  }
}
