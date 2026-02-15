const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        if (!user.accountId) {
            const newId = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`Backfilling Account ID for ${user.email} -> ${newId}`);
            await prisma.user.update({
                where: { id: user.id },
                data: { accountId: newId, balance: user.balance || 0 }
            });
        } else {
            console.log(`User ${user.email}: ID=${user.accountId}, Balance=${user.balance}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
