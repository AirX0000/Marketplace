const prisma = require('./config/database');

async function check() {
    try {
        const total = await prisma.marketplace.count();
        const approved = await prisma.marketplace.count({ where: { status: 'APPROVED' } });
        const pending = await prisma.marketplace.count({ where: { status: 'PENDING' } });
        const rejected = await prisma.marketplace.count({ where: { status: 'REJECTED' } });

        console.log(`Total Listings: ${total}`);
        console.log(`Approved: ${approved}`);
        console.log(`Pending: ${pending}`);
        console.log(`Rejected: ${rejected}`);

        if (total > 0) {
            const first = await prisma.marketplace.findFirst();
            console.log("Sample Listing:", first);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
