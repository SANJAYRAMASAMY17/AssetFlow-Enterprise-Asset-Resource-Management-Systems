import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../src/server/database/prisma.ts';

async function main() {
  const adminEmail = 'admin@assetflow.local';
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Admin',
        password: hashedPassword,
        role: Role.ADMIN,
      }
    });
    console.log('✅ Admin account created: admin@assetflow.local / admin123');
  } else {
    console.log('ℹ️ Admin account already exists.');
  }

  const category = await prisma.assetCategory.upsert({
    where: { name: 'Shared Resources' },
    update: {},
    create: { name: 'Shared Resources', description: 'Resources shared among employees' }
  });

  // Create shared resources
  const sharedAssets = [
    { name: 'Meeting Room A', assetTag: 'MR-001', isShared: true, status: 'AVAILABLE', serialNumber: 'MR-001-SN' },
    { name: 'Projector 1', assetTag: 'PRJ-001', isShared: true, status: 'AVAILABLE', serialNumber: 'PRJ-001-SN' },
    { name: 'Company Vehicle', assetTag: 'VEH-001', isShared: true, status: 'AVAILABLE', serialNumber: 'VEH-001-SN' },
    { name: 'Conference Room', assetTag: 'CR-001', isShared: true, status: 'AVAILABLE', serialNumber: 'CR-001-SN' }
  ];

  for (const asset of sharedAssets) {
    const existing = await prisma.asset.findUnique({
      where: { assetTag: asset.assetTag }
    });
    if (!existing) {
      await prisma.asset.create({
        data: {
          name: asset.name,
          assetTag: asset.assetTag,
          isShared: asset.isShared,
          status: 'AVAILABLE',
          serialNumber: asset.serialNumber,
          categoryId: category.id
        }
      });
      console.log(`✅ Shared asset created: ${asset.name}`);
    } else {
      console.log(`ℹ️ Shared asset already exists: ${asset.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
