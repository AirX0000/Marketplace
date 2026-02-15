const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding categories...');

    // Clear existing categories
    await prisma.category.deleteMany({});

    const categories = [
        {
            name: "Недвижимость", // Real Estate
            subcategories: JSON.stringify(["Квартиры", "Дома", "Коммерческая", "Земля"]),
        },
        {
            name: "Автомобили", // Cars
            subcategories: JSON.stringify(["Седан", "Кроссовер", "Внедорожник", "Электромобиль"]),
        },
        {
            name: "Электроника", // Electronics
            subcategories: JSON.stringify(["Смартфоны", "Ноутбуки", "Планшеты", "Аксессуары"]),
        },
        {
            name: "Одежда", // Clothing
            subcategories: JSON.stringify(["Мужская", "Женская", "Детская", "Обувь"]),
        },
        {
            name: "Дом и Сад", // Home & Garden
            subcategories: JSON.stringify(["Мебель", "Декор", "Садовая техника"]),
        }
    ];

    for (const cat of categories) {
        await prisma.category.create({
            data: cat
        });
        console.log(`✅ Created category: ${cat.name}`);
    }

    console.log('\n🎉 Categories seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding categories:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
