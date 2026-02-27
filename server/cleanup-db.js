const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up database for Cars and Houses restriction...');

    const allowedCategories = ['Transport', 'Real Estate'];

    // 1. Delete products in non-allowed categories
    const productsToDelete = await prisma.marketplace.deleteMany({
        where: {
            category: {
                notIn: allowedCategories
            }
        }
    });
    console.log(`✅ Deleted ${productsToDelete.count} non-compliant products.`);

    // 2. Delete non-allowed categories
    const categoriesToDelete = await prisma.category.deleteMany({
        where: {
            name: {
                notIn: allowedCategories
            }
        }
    });
    console.log(`✅ Deleted ${categoriesToDelete.count} non-compliant categories.`);

    // 3. Special case: Rename "Cars" to "Transport" if any products still exist with old category
    // Though seed-defaults will handle creation, if there are existing ones we might want to update them or just let the seed handle it.
    // Given the request, it's cleaner to just delete and re-seed.

    console.log('✨ Cleanup complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error during cleanup:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
