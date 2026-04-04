const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
    try {
        const categories = ["Транспорт", "Машины"];
        const result = await prisma.marketplace.findMany({
            where: {
                category: { in: categories, mode: 'insensitive' }
            }
        });
        console.log("Success:", result.length);
    } catch (e) {
        console.error("Prisma Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

testQuery();
