
const prisma = require('./config/database');

async function check() {
    try {
        const car = await prisma.marketplace.findUnique({
            where: { id: 'car-1' }
        });
        console.log("BMW X5 (car-1):", JSON.stringify(car, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
