const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const userService = require('./server/services/user.service');

async function test() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Testing recs for user:", user.id);
    const recs = await userService.getRecommendations(user.id);
    console.log("Found recs:", recs.length);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
test();
