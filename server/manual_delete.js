const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to delete 'Samarkand' or any other duplicate regions...");

    // Find regions
    const regions = await prisma.region.findMany({
        where: { name: "Samarkand" }
    });

    if (regions.length === 0) {
        console.log("No region named 'Samarkand' found.");
    } else {
        for (const r of regions) {
            await prisma.region.delete({
                where: { id: r.id }
            });
            console.log(`Deleted region: ${r.name} (ID: ${r.id})`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
