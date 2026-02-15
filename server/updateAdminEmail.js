const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminEmail() {
    try {
        // Find user with email 'v'
        const oldAdmin = await prisma.user.findUnique({ where: { email: 'v' } });

        if (oldAdmin) {
            // Update email to admin@aura.com
            await prisma.user.update({
                where: { email: 'v' },
                data: { email: 'admin@aura.com' }
            });
            console.log('✅ Admin email updated: v → admin@aura.com');
        } else {
            console.log('ℹ️  No admin with email "v" found');
        }

        console.log('\n📝 New login credentials:');
        console.log('   ADMIN: admin@aura.com / password123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdminEmail();
