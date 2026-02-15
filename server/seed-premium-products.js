const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding premium products...');

    const partner = await prisma.user.findFirst({
        where: { role: 'PARTNER' }
    });

    if (!partner) {
        console.error('❌ No partner found. Please run seed-users.js first.');
        process.exit(1);
    }

    const premiumProducts = [
        {
            name: 'Infinity Glass Residence',
            description: 'Ultra-modern luxury residence with panoramic city views, infinity pool, and state-of-the-art smart home integration.',
            price: 4500000,
            image: '/uploads/luxury_house.png',
            category: 'Real Estate',
            region: 'Tashkent',
            ownerId: partner.id,
            status: 'APPROVED',
            lat: 41.3111,
            lng: 69.2406,
            attributes: JSON.stringify({
                type: 'Apartment',
                rooms: 5,
                area: '350 m²',
                floor: 24,
                features: ['Smart Home', 'Pool', 'Gym']
            })
        },
        {
            name: 'Eco-Haven Forest Villa',
            description: 'Sustainable luxury living integrated with nature. Features solar energy, natural stone textures, and a private botanical garden.',
            price: 7200000,
            image: '/uploads/eco_villa.png',
            category: 'Real Estate',
            region: 'Tashkent Region',
            ownerId: partner.id,
            status: 'APPROVED',
            lat: 41.5111,
            lng: 69.6406,
            attributes: JSON.stringify({
                type: 'Villa',
                rooms: 8,
                area: '1200 m²',
                features: ['Solar Panels', 'Garden', 'Security']
            })
        },
        {
            name: 'Aura S-Series Electric',
            description: 'Experience the future of driving. 0-100 km/h in 2.8 seconds. Level 4 autonomous driving and ultra-fast charging.',
            price: 125000,
            image: '/uploads/electric_car.png',
            category: 'Transport',
            region: 'Tashkent',
            ownerId: partner.id,
            status: 'APPROVED',
            lat: 41.2995,
            lng: 69.2401,
            attributes: JSON.stringify({
                type: 'Cars',
                year: 2025,
                mileage: '0 km',
                engine: 'Dual Motor Electric',
                transmission: 'Single Speed',
                range: '850 km'
            })
        },
        {
            name: 'Aura Commander SUV',
            description: 'The ultimate luxury off-roader. Performance meets comfort in this black metallic beast designed for the city and beyond.',
            price: 185000,
            image: '/uploads/luxury_suv.png',
            category: 'Transport',
            region: 'Tashkent',
            ownerId: partner.id,
            status: 'APPROVED',
            lat: 41.3000,
            lng: 69.2500,
            attributes: JSON.stringify({
                type: 'Cars',
                year: 2024,
                mileage: '120 km',
                engine: '4.0L V8 Biturbo',
                transmission: '9-speed Automatic',
                drive: '4MATIC'
            })
        }

    ];

    for (const prod of premiumProducts) {
        const created = await prisma.marketplace.create({
            data: prod
        });
        console.log(`✅ Created: ${created.name}`);
    }

    console.log('\n🎉 Premium seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
