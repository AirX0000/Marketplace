
const { PrismaClient } = require('@prisma/client');
const { seedDefaults } = require('./seed-defaults');
require('./config/env');

const prisma = new PrismaClient();

async function run() {
    try {
        console.log("🚀 Starting manual seed-defaults...");
        await prisma.$connect();
        await seedDefaults(prisma);
        console.log("✅ Manual seed-defaults completed successfully!");
    } catch (error) {
        console.error("❌ Seed error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

run();
