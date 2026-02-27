const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding sample orders...');

    // Get all users and products
    const users = await prisma.user.findMany({ where: { role: 'USER' } });
    const products = await prisma.marketplace.findMany({ include: { owner: true } });

    if (users.length === 0 || products.length === 0) {
        console.log('❌ Create users and products first!');
        return;
    }

    console.log(`Found ${users.length} users and ${products.length} products.`);

    // Generate 50 random orders over last 30 days
    const ordersToCreate = 50;

    for (let i = 0; i < ordersToCreate; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        // Random number of items (1-3)
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let totalPrice = 0;

        for (let j = 0; j < itemCount; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;

            items.push({
                marketplaceId: product.id,
                quantity: quantity,
                price: product.price,
                status: 'Processing' // Default per item status
            });
            totalPrice += product.price * quantity;
        }

        // Random date in last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        // Create Order
        await prisma.order.create({
            data: {
                userId: user.id,
                total: totalPrice,
                status: Math.random() > 0.2 ? 'DELIVERED' : 'Processing', // 80% delivered for stats
                createdAt: date,
                updatedAt: date,
                items: {
                    create: items
                }
            }
        });
    }

    console.log(`✅ Successfully created ${ordersToCreate} sample orders!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
