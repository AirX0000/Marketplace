const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const categories = [
    {
      name: 'Транспорт',
      subcategories: [
        'Бозор (Авто с пробегом)',
        'Автосалон (Новые авто)',
        'Мотоциклы',
        'Спецтехника'
      ]
    },
    {
      name: 'Недвижимость',
      subcategories: [
        'Вторичное жильё',
        'Новостройки',
        'Аренда',
        'Участки',
        'Коммерческая недвижимость',
        'Apartments',
        'Houses',
        'Land'
      ]
    },
    {
      name: 'Услуги',
      subcategories: [
        'Риелтор',
        'Нотариус',
        'Оценка',
        'Страхование'
      ]
    }
  ];

  console.log('--- Starting Category Sync ---');

  for (const cat of categories) {
    try {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: { subcategories: JSON.stringify(cat.subcategories) },
        create: {
          name: cat.name,
          subcategories: JSON.stringify(cat.subcategories)
        }
      });
      console.log(`✓ Upserted: ${cat.name}`);
    } catch (e) {
      console.error(`✗ Error on ${cat.name}:`, e.message);
    }
  }

  // Handle potential "Real Estate" English entry by merging it if needed
  try {
    const englishRE = await prisma.category.findUnique({ where: { name: 'Real Estate' } });
    if (englishRE) {
      console.log('! Found English "Real Estate" entry. You should manually check if any products use it before deletion.');
      // Optionally merge or rename:
      // await prisma.marketplace.updateMany({ where: { category: 'Real Estate' }, data: { category: 'Недвижимость' } });
      // await prisma.category.delete({ where: { name: 'Real Estate' } });
    }
  } catch (e) {}

  console.log('--- Sync Completed ---');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
