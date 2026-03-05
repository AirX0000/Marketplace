const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
        let i = 1;
        for (const user of users) {
            await prisma.user.update({
                where: { id: user.id },
                data: { accountId: i.toString() }
            });
            console.log(`Updated user ${user.email || user.phone} to accountId ${i}`);
            i++;
        }
        console.log('Successfully updated', users.length, 'users');
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

run();
