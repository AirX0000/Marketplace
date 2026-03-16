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
        'Коммерческая недвижимость'
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
      console.log(`Upserted category: ${cat.name}`);
    } catch (e) {
      console.error(`Error on ${cat.name}:`, e);
    }
  }
}

seed().then(() => {
  console.log('Categories seeded completely.');
  process.exit(0);
});
