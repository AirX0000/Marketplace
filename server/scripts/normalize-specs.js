const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function normalize() {
  console.log('--- Starting Data Normalization (specs values to numbers) ---');
  
  const listings = await prisma.marketplace.findMany({
    where: { specs: { not: null } }
  });

  let updatedCount = 0;
  for (const item of listings) {
    let specs = item.specs;
    if (typeof specs === 'string') {
      try { specs = JSON.parse(specs); } catch(e) { continue; }
    }
    
    let changed = false;
    const numericFields = ['year', 'mileage', 'area', 'rooms', 'floor'];
    
    for (const field of numericFields) {
      if (specs[field] !== undefined && typeof specs[field] === 'string') {
        const num = parseFloat(specs[field].replace(/[^\d.]/g, ''));
        if (!isNaN(num)) {
          specs[field] = num;
          changed = true;
        }
      }
    }

    if (changed) {
      await prisma.marketplace.update({
        where: { id: item.id },
        data: { specs }
      });
      updatedCount++;
    }
  }

  console.log(`✓ Normalized ${updatedCount} listings.`);
  console.log('--- Normalization Completed ---');
}

normalize().catch(console.error).finally(() => prisma.$disconnect());
