const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const result = await prisma.$queryRaw`SHOW max_connections`;
    console.log("Max Connections allowed:", result);
    
    const active = await prisma.$queryRaw`SELECT count(*) FROM pg_stat_activity`;
    console.log("Currently Active Connections:", active);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
