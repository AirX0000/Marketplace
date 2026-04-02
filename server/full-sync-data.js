const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fullSync() {
  console.log('--- Starting Full Data Synchronization ---');

  // 1. Ensure core categories exist in DB
  const coreCategories = [
    { name: 'Транспорт', sub: ["Бозор (Авто с пробегом)", "Автосалон (Новые авто)", "Мотоциклы", "Спецтехника"] },
    { name: 'Недвижимость', sub: ["Вторичное жильё", "Новостройки", "Аренда", "Участки", "Коммерческая недвижимость", "Apartments", "Houses", "Land"] },
    { name: 'Услуги', sub: ["Риелтор", "Нотариус", "Оценка", "Страхование"] },
    { name: 'Электроника', sub: ["Smartphones", "Laptops", "Tablets", "Accessories"] }
  ];

  for (const cat of coreCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { subcategories: JSON.stringify(cat.sub) },
      create: { name: cat.name, subcategories: JSON.stringify(cat.sub) }
    });
    console.log(`✓ Synchronized category: ${cat.name}`);
  }

  // 2. Normalize Marketplace products
  const products = await prisma.marketplace.findMany();
  let updatedCount = 0;

  for (const product of products) {
    let newCategory = product.category;
    const catLower = product.category.toLowerCase();

    // Mapping logic
    if (['auto', 'cars', 'автомобили', 'transport'].some(s => catLower.includes(s))) {
      newCategory = 'Транспорт';
    } else if (['real estate', 'property', 'недвижимость', 'uy', 'joy'].some(s => catLower.includes(s))) {
      newCategory = 'Недвижимость';
    } else if (['services', 'услуги', 'xizmat'].some(s => catLower.includes(s))) {
      newCategory = 'Услуги';
    } else if (['electronics', 'электроника', 'texnika'].some(s => catLower.includes(s))) {
      newCategory = 'Электроника';
    }

    if (newCategory !== product.category) {
      await prisma.marketplace.update({
        where: { id: product.id },
        data: { category: newCategory }
      });
      updatedCount++;
    }
  }

  console.log(`✓ Normalized ${updatedCount} products to master categories.`);

  // 3. Clean up non-master categories that are now empty
  const allDbCategories = await prisma.category.findMany();
  const masterNames = coreCategories.map(c => c.name);
  
  for (const dbCat of allDbCategories) {
    if (!masterNames.includes(dbCat.name)) {
      // Check if any products still use this category (just in case)
      const count = await prisma.marketplace.count({ where: { category: dbCat.name } });
      if (count === 0) {
        await prisma.category.delete({ where: { id: dbCat.id } });
        console.log(`✓ Deleted empty obsolete category: ${dbCat.name}`);
      }
    }
  }

  console.log('--- Full Synchronization Finished ---');
}

fullSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
