const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('--- Database Category Cleanup ---');
  
  // 1. Move listings from 'Автомобили' to 'Транспорт'
  try {
    const autoCount = await prisma.marketplace.count({ where: { category: 'Автомобили' } });
    if (autoCount > 0) {
      await prisma.marketplace.updateMany({
        where: { category: 'Автомобили' },
        data: { category: 'Транспорт' }
      });
      console.log(`✓ Moved ${autoCount} listings from Автомобили to Транспорт`);
    } else {
      console.log('- No listings in Автомобили category');
    }
  } catch (e) {
    console.error('! Error moving Автомобили:', e.message);
  }

  // 2. Delete 'Автомобили' category row if it exists
  try {
    const autoCat = await prisma.category.findFirst({ where: { name: 'Автомобили' } });
    if (autoCat) {
      await prisma.category.delete({ where: { id: autoCat.id } });
      console.log('✓ Deleted Автомобили category record');
    } else {
      console.log('- Автомобили category record not found');
    }
  } catch (e) {
    console.error('! Error deleting Автомобили cat:', e.message);
  }

  // 3. Move listings from 'Real Estate' to 'Недвижимость'
  try {
    const reCount = await prisma.marketplace.count({ where: { category: 'Real Estate' } });
    if (reCount > 0) {
      await prisma.marketplace.updateMany({
        where: { category: 'Real Estate' },
        data: { category: 'Недвижимость' }
      });
      console.log(`✓ Moved ${reCount} listings from Real Estate to Недвижимость`);
    } else {
      console.log('- No listings in Real Estate category');
    }
  } catch (e) {
    console.error('! Error moving Real Estate:', e.message);
  }

  // 4. Delete 'Real Estate' category row if it exists
  try {
    const reCat = await prisma.category.findFirst({ where: { name: 'Real Estate' } });
    if (reCat) {
      await prisma.category.delete({ where: { id: reCat.id } });
      console.log('✓ Deleted Real Estate category record');
    } else {
      console.log('- Real Estate category record not found');
    }
  } catch (e) {
    console.error('! Error deleting Real Estate cat:', e.message);
  }

  console.log('--- Cleanup Finished ---');
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
