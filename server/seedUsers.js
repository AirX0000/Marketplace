const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
    console.log('🌱 Seeding users...');

    try {
        // 1. Create ADMIN user
        const adminExists = await prisma.user.findUnique({ where: { email: 'admin@aura.com' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'admin@aura.com',
                    password: hashedPassword,
                    name: 'Главный Администратор',
                    role: 'ADMIN'
                }
            });
            console.log('✅ Admin created: admin@aura.com / password123');
        } else {
            console.log('ℹ️  Admin already exists');
        }

        // 2. Create USER
        const userExists = await prisma.user.findUnique({ where: { email: 'user@aura.com' } });
        if (!userExists) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'user@aura.com',
                    password: hashedPassword,
                    name: 'Тестовый Пользователь',
                    role: 'USER'
                }
            });
            console.log('✅ User created: user@aura.com / password123');
        } else {
            console.log('ℹ️  User already exists');
        }

        // 3. Create PARTNER
        const partnerExists = await prisma.user.findUnique({ where: { email: 'partner@aura.com' } });
        if (!partnerExists) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'partner@aura.com',
                    password: hashedPassword,
                    name: 'Tech World',
                    role: 'PARTNER',
                    storeName: 'Tech World',
                    storeDescription: 'Официальный магазин электроники',
                    storeColor: '#3b82f6'
                }
            });
            console.log('✅ Partner created: partner@aura.com / password123');
        } else {
            console.log('ℹ️  Partner already exists');
        }

        console.log('\n🎉 Users seeded successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   ADMIN:   admin@aura.com / password123');
        console.log('   USER:    user@aura.com / password123');
        console.log('   PARTNER: partner@aura.com / password123');

    } catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedUsers()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
