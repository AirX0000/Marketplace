const prisma = require('../config/database');
const { slugify } = require('../utils/slugify');

async function run() {
    console.log("Fetching marketplaces without slugs...");
    const items = await prisma.marketplace.findMany({
        where: { slug: null }
    });

    console.log(`Found ${items.length} items to update.`);
    let count = 0;

    for (const item of items) {
        let baseSlug = slugify(item.name || 'product') || 'product';
        const uniqueSuffix = Math.random().toString(36).substring(2, 8);
        const slug = `${baseSlug}-${uniqueSuffix}`;

        await prisma.marketplace.update({
            where: { id: item.id },
            data: { slug }
        });
        count++;
    }
    console.log(`Successfully updated ${count} items.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
