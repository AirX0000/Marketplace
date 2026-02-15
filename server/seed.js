const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Seed Categories
    const categories = [
        { name: "Electronics", sub: ["Smartphones", "Laptops", "Headphones", "Cameras", "Accessories"] },
        { name: "Appliances", sub: ["Refrigerators", "Washing Machines", "Vacuums", "Air Conditioners"] },
        { name: "Clothing", sub: ["Men", "Women", "Kids", "Shoes", "Accessories"] },
        { name: "Home & Garden", sub: ["Furniture", "Decor", "Garden", "Lighting"] },
        { name: "Beauty & Health", sub: ["Makeup", "Skincare", "Vitamins", "Perfume"] },
        { name: "Real Estate", sub: ["Apartments", "Houses", "Commercial", "Land"] },
        { name: "Cars", sub: ["Sedan", "SUV", "Truck", "Electric"] },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: { subcategories: JSON.stringify(cat.sub) },
            create: { name: cat.name, subcategories: JSON.stringify(cat.sub) }
        });
    }
    console.log('✅ Categories seeded');

    // 2. Seed Regions
    const regions = ["Global", "North America", "Europe", "Asia", "Tashkent", "Samarkand", "Bukhara", "Fergana"];
    for (const r of regions) {
        await prisma.region.upsert({
            where: { name: r },
            update: {},
            create: { name: r }
        });
    }
    console.log('✅ Regions seeded');

    // 3. Seed Users (Admin, Partner, User)
    const password = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Admin
    await prisma.user.upsert({
        where: { email: 'admin@aura.uz' },
        update: {},
        create: {
            email: 'admin@aura.uz',
            password: adminPassword,
            name: 'Super Admin',
            role: 'ADMIN',
            isPhoneVerified: true
        }
    });

    // Partner
    const partner = await prisma.user.upsert({
        where: { email: 'demo@partner.com' },
        update: {
            storeName: 'Tech World',
            storeDescription: 'Premier electronics retailer in Tashkent',
            storeColor: '#3b82f6',
            role: 'PARTNER'
        },
        create: {
            email: 'demo@partner.com',
            password: password,
            name: 'Tech World Owner',
            role: 'PARTNER',
            storeName: 'Tech World',
            storeDescription: 'Premier electronics retailer in Tashkent',
            storeColor: '#3b82f6',
            accountId: '999111'
        }
    });

    // Regular User
    await prisma.user.upsert({
        where: { email: 'user@mail.com' },
        update: {},
        create: {
            email: 'user@mail.com',
            password: password,
            name: 'John Doe',
            role: 'USER',
            accountId: '888000'
        }
    });
    console.log('✅ Users seeded');

    // 4. Seed Products
    const products = [
        {
            id: 'm1',
            name: 'iPhone 15 Pro Max',
            description: 'Titanium design, A17 Pro chip, 48MP Main camera. The most powerful iPhone ever featuring a durable and lightweight titanium design.',
            price: 18500000,
            discount: 5,
            category: 'Electronics',
            region: 'Tashkent',
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=1000'
            ]),
            isAvailable: true,
            stock: 50,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.8,
            views: 1250
        },
        {
            id: 'm2',
            name: 'MacBook Air M2',
            description: 'Supercharged by M2 chip. Strikingly thin design. Go inside the new MacBook Air with M2.',
            price: 15200000,
            discount: 10,
            category: 'Electronics',
            region: 'Tashkent',
            image: 'https://images.unsplash.com/photo-1661961110671-77b71b929d52?auto=format&fit=crop&q=80&w=1000',
            isAvailable: true,
            stock: 30,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.9,
            views: 890
        },
        {
            id: 'm3',
            name: 'Sony WH-1000XM5',
            description: 'Industry leading noise canceling headphones with Auto NC optimizer, crystal clear hands free calling.',
            price: 4200000,
            discount: 0,
            category: 'Electronics',
            region: 'Tashkent',
            image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000',
            isAvailable: true,
            stock: 15,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 4.7,
            views: 450
        },
        {
            id: 'm4',
            name: 'BMW X5 2023',
            description: 'Luxury SUV, Full Option, Low Mileage. Perfect condition, serviced at official dealer.',
            price: 850000000,
            discount: 0,
            category: 'Cars',
            region: 'Tashkent',
            image: 'https://images.unsplash.com/photo-1555215696-99776b92f398?auto=format&fit=crop&q=80&w=1000',
            isAvailable: true,
            stock: 1,
            status: 'APPROVED',
            ownerId: partner.id,
            rating: 5.0,
            views: 3200
        }
    ];

    for (const p of products) {
        await prisma.marketplace.upsert({
            where: { id: p.id },
            update: p,
            create: p
        });
    }
    console.log('✅ Products seeded');

    // 5. Seed System Settings
    const settings = [
        { key: 'enable_installments', value: 'true' },
        { key: 'installment_months', value: '3,6,12' },
        { key: 'interest_rate', value: '0' },
    ];

    for (const s of settings) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: s
        });
    }
    console.log('✅ Settings seeded');

    console.log('🌱 Seeding done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
