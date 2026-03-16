const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMortgageItems() {
  const count = await prisma.marketplace.count({ where: { category: 'Ипотека' } });
  console.log(`Found ${count} items in Ипотека category`);
  
  if (count > 0) {
    const items = await prisma.marketplace.findMany({ where: { category: 'Ипотека' }, select: { id: true, name: true, category: true } });
    console.log(items);
    
    const update = await prisma.marketplace.updateMany({
      where: { category: 'Ипотека' },
      data: { category: 'Вторичное жильё' }
    });
    console.log(`Updated ${update.count} items to 'Вторичное жильё'`);
  }
}

checkMortgageItems()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
