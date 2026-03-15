const prisma = require('./config/database');
const userService = require('./services/user.service');

async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found");
        return;
    }
    console.log("Testing recs for user:", user.id);
    const recs = await userService.getRecommendations(user.id);
    console.log("Found recs:", recs.length);
  } catch (e) {
    console.error("Error getRecommendations:", e);
  } finally {
    process.exit(0);
  }
}
test();
