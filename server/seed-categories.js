const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const categories = [
    {
      name: 'Транспорт',
      subcategories: ['Легковые автомобили', 'С пробегом', 'Новые', 'Электромобили', 'Грузовые', 'Спецтехника', 'Мототехника', 'Автобусы', 'Водный транспорт']
    },
    {
      name: 'Недвижимость',
      subcategories: ['Новостройки', 'Квартиры', 'Дома и дачи', 'Коммерческая недвижимость', 'Земельные участки', 'Гаражи и парковки']
    },
    {
      name: 'Услуги',
      subcategories: ['Автосервис', 'Ремонт и строительство', 'Риэлторы', 'Нотариусы', 'Юристы', 'Уборка', 'Грузоперевозки']
    },
    {
      name: 'Ипотека',
      subcategories: ['Автокредит', 'Ипотека', 'Потребительский кредит']
    },
    {
      name: 'Запчасти и аксессуары',
      subcategories: ['Шины и диски', 'Автозапчасти', 'Аксессуары', 'Аудио и видео', 'Масла и химия']
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
  console.log('Done');
  process.exit(0);
});
