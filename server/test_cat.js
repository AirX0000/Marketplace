const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const all = await prisma.marketplace.findMany({ select: { name: true, category: true }});
  console.log("Total listings:", all.length);
  const realEstateMatches = all.filter(l => [
    "Real Estate", "Недвижимость", "Квартиры", "Дома", "Коммерческая", "Земля", "Apartments", "Houses", "New Building", "Private House", "Property", "Вторичные", "Вторичное жильё", "Новостройки", "Нежилое помещение", "Аренда", "Участки"
  ].includes(l.category));
  console.log("Real Estate count:", realEstateMatches.length);
  realEstateMatches.slice(0, 5).forEach(m => console.log(m.name, m.category));
  
  const transportMatches = all.filter(l => [
    "Transport", "Cars", "Автомобили", "Авто", "Автосалон", "С пробегом", "Новый без пробега", "Dealer", "Private Auto", "Vehicle", "Бозор (Авто с пробегом)", "Автосалон (Новые авто)"
  ].includes(l.category));
  console.log("\nTransport count:", transportMatches.length);
  transportMatches.slice(0, 5).forEach(m => console.log(m.name, m.category));
}
check().catch(console.error).finally(() => prisma.$disconnect());
