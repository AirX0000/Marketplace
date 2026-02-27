const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const partners = await prisma.user.findMany({
            where: { role: 'PARTNER' }
        });
        console.log("Partners found:", partners.length);
        if (partners.length > 0) {
            console.log("First partner:", partners[0].email, partners[0].name);
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
