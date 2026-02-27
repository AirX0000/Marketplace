// Extended seed script to create diverse test users for all roles
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding comprehensive test users...\n');

    // Hash password (same for all test users for convenience)
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
        // ========== ADMIN USERS ==========
        {
            email: 'admin@aura.com',
            password: hashedPassword,
            name: 'Главный Администратор',
            role: 'ADMIN'
        },
        {
            email: 'admin.support@aura.com',
            password: hashedPassword,
            name: 'Администратор Поддержки',
            role: 'ADMIN'
        },

        // ========== PARTNER USERS (Sellers/Vendors) ==========
        {
            email: 'partner@aura.com',
            password: hashedPassword,
            name: 'TechStore Uzbekistan',
            role: 'PARTNER',
            storeName: 'TechStore UZ',
            storeDescription: 'Официальный дилер Apple, Samsung, Xiaomi в Узбекистане',
            storeColor: '#10b981'
        },
        {
            email: 'fashion.partner@aura.com',
            password: hashedPassword,
            name: 'Fashion House Tashkent',
            role: 'PARTNER',
            storeName: 'Fashion House',
            storeDescription: 'Брендовая одежда и аксессуары из Европы',
            storeColor: '#ec4899'
        },
        {
            email: 'home.partner@aura.com',
            password: hashedPassword,
            name: 'Home & Garden Store',
            role: 'PARTNER',
            storeName: 'Дом и Сад',
            storeDescription: 'Все для вашего дома и сада',
            storeColor: '#f59e0b'
        },
        {
            email: 'sports.partner@aura.com',
            password: hashedPassword,
            name: 'SportLife Uzbekistan',
            role: 'PARTNER',
            storeName: 'SportLife',
            storeDescription: 'Профессиональная спортивная экипировка',
            storeColor: '#3b82f6'
        },
        {
            email: 'beauty.partner@aura.com',
            password: hashedPassword,
            name: 'Beauty & Care',
            role: 'PARTNER',
            storeName: 'Beauty Care',
            storeDescription: 'Косметика мировых брендов',
            storeColor: '#a855f7'
        },

        // ========== REGULAR USERS (Buyers) ==========
        {
            email: 'user@aura.com',
            password: hashedPassword,
            name: 'Алишер Каримов',
            role: 'USER'
        },
        {
            email: 'user2@aura.com',
            password: hashedPassword,
            name: 'Нигора Рахимова',
            role: 'USER'
        },
        {
            email: 'user3@aura.com',
            password: hashedPassword,
            name: 'Дилшод Усманов',
            role: 'USER'
        },
        {
            email: 'user4@aura.com',
            password: hashedPassword,
            name: 'Малика Азимова',
            role: 'USER'
        },
        {
            email: 'user5@aura.com',
            password: hashedPassword,
            name: 'Шохрух Турсунов',
            role: 'USER'
        }
    ];

    console.log('Creating users...\n');

    for (const userData of users) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: userData
        });

        const roleEmoji = user.role === 'ADMIN' ? '👑' : user.role === 'PARTNER' ? '🏪' : '👤';
        console.log(`${roleEmoji} Created ${user.role.padEnd(8)} | ${user.email.padEnd(30)} | ${user.name}`);
    }

    console.log('\n✅ All users created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TEST CREDENTIALS (Password: password123 for all)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('👑 ADMIN ACCOUNTS:');
    console.log('  1. admin@aura.com              - Главный Администратор');
    console.log('  2. admin.support@aura.com      - Администратор Поддержки\n');

    console.log('🏪 PARTNER ACCOUNTS (Sellers):');
    console.log('  1. partner@aura.com            - TechStore Uzbekistan (Электроника)');
    console.log('  2. fashion.partner@aura.com    - Fashion House (Одежда)');
    console.log('  3. home.partner@aura.com       - Home & Garden (Дом и Сад)');
    console.log('  4. sports.partner@aura.com     - SportLife (Спорт)');
    console.log('  5. beauty.partner@aura.com     - Beauty & Care (Косметика)\n');

    console.log('👤 USER ACCOUNTS (Buyers):');
    console.log('  1. user@aura.com               - Алишер Каримов');
    console.log('  2. user2@aura.com              - Нигора Рахимова');
    console.log('  3. user3@aura.com              - Дилшод Усманов');
    console.log('  4. user4@aura.com              - Малика Азимова');
    console.log('  5. user5@aura.com              - Шохрух Турсунов\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Usage:');
    console.log('   - All passwords: password123');
    console.log('   - Login at: http://localhost:5173/login');
    console.log('   - Admin panel: http://localhost:5173/admin');
    console.log('   - User profile: http://localhost:5173/profile');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Summary
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const partnerCount = users.filter(u => u.role === 'PARTNER').length;
    const userCount = users.filter(u => u.role === 'USER').length;

    console.log('📊 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Partners: ${partnerCount}`);
    console.log(`   - Users: ${userCount}\n`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
