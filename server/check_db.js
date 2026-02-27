const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("--- Categories ---");
    const categories = await prisma.category.findMany();
    console.log(JSON.stringify(categories, null, 2));

    console.log("\n--- Regions ---");
    const regions = await prisma.region.findMany();
    console.log(JSON.stringify(regions, null, 2));

    console.log("\n--- Listings ---");
    const listings = await prisma.marketplace.findMany({
        select: { id: true, name: true, category: true, region: true, price: true }
    });
    console.log(JSON.stringify(listings, null, 2));
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
