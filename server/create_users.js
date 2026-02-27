const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("Creating test users...");
    const password = await bcrypt.hash('password123', 10);

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@aura.com' },
        update: {
            role: 'ADMIN',
            password,
            name: 'Super Admin'
        },
        create: {
            email: 'admin@aura.com',
            name: 'Super Admin',
            password,
            role: 'ADMIN'
        }
    });

    // Create Partner
    const partner = await prisma.user.upsert({
        where: { email: 'partner@aura.com' },
        update: {
            role: 'PARTNER',
            password,
            name: 'Demo Partner'
        },
        create: {
            email: 'partner@aura.com',
            name: 'Demo Partner',
            password,
            role: 'PARTNER',
            storeName: 'Aura Tech Store',
            storeDescription: 'Premier electronics retailer',
            storeColor: '#10b981'
        }
    });

    console.log('Success! Created/Updated Users:');
    console.log('--------------------------------------------------');
    console.log('ADMIN ACCOUNT:');
    console.log('Email:    admin@aura.com');
    console.log('Password: password123');
    console.log('--------------------------------------------------');
    console.log('PARTNER ACCOUNT:');
    console.log('Email:    partner@aura.com');
    console.log('Password: password123');
    console.log('--------------------------------------------------');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
