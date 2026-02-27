const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@aura.com' },
        update: {},
        create: {
            email: 'admin@aura.com',
            password: adminPassword,
            name: 'Admin',
            role: 'ADMIN'
        }
    });
    console.log('✓ Admin user created');

    // Create partner user
    const partnerPassword = await bcrypt.hash('partner123', 10);
    const partner = await prisma.user.upsert({
        where: { email: 'partner@aura.com' },
        update: {},
        create: {
            email: 'partner@aura.com',
            password: partnerPassword,
            name: 'Tech Store Uzbekistan',
            role: 'PARTNER'
        }
    });
    console.log('✓ Partner user created');

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@test.com' },
        update: {},
        create: {
            email: 'user@test.com',
            password: userPassword,
            name: 'Test User',
            role: 'USER'
        }
    });
    console.log('✓ Regular user created');

    // Create marketplaces with APPROVED status
    const marketplaces = [
        {
            name: 'Samsung Galaxy S24 Ultra',
            description: 'Флагманский смартфон с камерой 200MP, процессором Snapdragon 8 Gen 3 и S Pen',
            region: 'Tashkent',
            category: 'Электроника',
            price: 14500000,
            discount: 10,
            image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800']),
            stock: 15,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.8
        },
        {
            name: 'Mercedes-Benz S-Class',
            description: 'Премиум седан 2023 года, полная комплектация, кожаный салон, автопилот',
            region: 'Tashkent',
            category: 'Авто',
            price: 2100000000,
            discount: 0,
            image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800']),
            stock: 2,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.9
        },
        {
            name: 'Toyota Camry 70',
            description: 'Новая Toyota Camry 2024, гибрид, экономичный расход топлива',
            region: 'Samarkand',
            category: 'Авто',
            price: 420000000,
            discount: 5,
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800']),
            stock: 8,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.7
        },
        {
            name: 'BMW X5 M-Package',
            description: 'Спортивная версия кроссовера BMW X5, мощный двигатель, роскошный интерьер',
            region: 'Tashkent',
            category: 'Авто',
            price: 1250000000,
            discount: 0,
            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800']),
            stock: 3,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.8
        },
        {
            name: 'Kia Seltos Style',
            description: 'Компактный современный кроссовер с панорамной крышей',
            region: 'Bukhara',
            category: 'Авто',
            price: 310000000,
            discount: 8,
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800']),
            stock: 12,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.5
        },
        {
            name: 'Chevrolet Malibu 2 Premier',
            description: 'Комфортный седан с турбированным двигателем, премиум салон',
            region: 'Andijan',
            category: 'Авто',
            price: 385000000,
            discount: 10,
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800']),
            stock: 6,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.6
        },
        {
            name: 'Family Villa with Pool',
            description: 'Просторная вилла с 4 спальнями, бассейном и садом. Престижный район Тошкента',
            region: 'Tashkent',
            category: 'Недвижимость',
            price: 8500000000,
            discount: 0,
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800']),
            stock: 1,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.9
        },
        {
            name: 'Modern Loft Studio',
            description: 'Современная лофт-студия 45м² в центре города, дизайнерский ремонт',
            region: 'Tashkent',
            category: 'Недвижимость',
            price: 950000000,
            discount: 5,
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),
            stock: 1,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.7
        },
        {
            name: 'Green Valley Cottage',
            description: 'Уютный коттедж в пригороде, 3 спальни, камин, большой участок',
            region: 'Fergana',
            category: 'Недвижимость',
            price: 3200000000,
            discount: 0,
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800']),
            stock: 1,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.8
        },
        {
            name: 'Infinity Luxury Residence',
            description: 'Пентхаус с панорамным видом, 200м², терраса, консьерж-сервис',
            region: 'Tashkent',
            category: 'Недвижимость',
            price: 2450000000,
            discount: 0,
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            images: JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800']),
            stock: 1,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 5.0
        }
    ];

    for (const marketplace of marketplaces) {
        await prisma.marketplace.create({ data: marketplace });
    }
    console.log(`✓ Created ${marketplaces.length} marketplace products (all APPROVED)`);

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
