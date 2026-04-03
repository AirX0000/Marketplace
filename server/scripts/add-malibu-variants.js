const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Malibu Variants...');

    // Find a partner to own these listings
    let partner = await prisma.user.findFirst({
        where: { role: 'PARTNER' }
    });

    if (!partner) {
        console.log('⚠️ No partner found, creating default partner...');
        partner = await prisma.user.create({
            data: {
                email: 'malibu_dealer@test.uz',
                password: '$2a$10$789', // Not usable but required
                name: 'Tashkent Auto Salon',
                role: 'PARTNER'
            }
        });
    }

    const variants = [
        {
            name: 'Chevrolet Malibu 2 Premier (Белый)',
            description: 'Идеальное состояние, цвет «Белый Жемчуг». Максимальная комплектация Premier. Мотор 2.0 Турбо.',
            price: 385000000,
            image: '/uploads/malibu_white.png',
            images: JSON.stringify(['/uploads/malibu_white.png']),
            category: 'Седан',
            ownerId: partner.id,
            region: 'Tashkent',
            status: 'APPROVED',
            lat: 41.2995,
            lng: 69.2401,
            attributes: JSON.stringify({
                colors: [
                    { name: 'Белый', hex: '#FFFFFF', image: '/uploads/malibu_white.png' },
                    { name: 'Серый', hex: '#808080', image: '/uploads/malibu_grey.png' },
                    { name: 'Черный', hex: '#000000', image: '/uploads/malibu_black.png' }
                ],
                specs: {
                    year: 2024,
                    mileage: 0,
                    engine: "2.0 Turbo",
                    transmission: "Автомат",
                    color: "Белый",
                    bodyType: "Седан"
                }
            })
        },
        {
            name: 'Chevrolet Malibu 2 Premier (Серый)',
            description: 'Премиальный седан в цвете «Мокрый асфальт». Стильный и динамичный.',
            price: 385000000,
            image: '/uploads/malibu_grey.png',
            images: JSON.stringify(['/uploads/malibu_grey.png']),
            category: 'Седан',
            ownerId: partner.id,
            region: 'Tashkent',
            status: 'APPROVED',
            lat: 41.2995,
            lng: 69.2401,
            attributes: JSON.stringify({
                colors: [
                    { name: 'Белый', hex: '#FFFFFF', image: '/uploads/malibu_white.png' },
                    { name: 'Серый', hex: '#808080', image: '/uploads/malibu_grey.png' },
                    { name: 'Черный', hex: '#000000', image: '/uploads/malibu_black.png' }
                ],
                specs: {
                    year: 2024,
                    mileage: 0,
                    engine: "2.0 Turbo",
                    transmission: "Автомат",
                    color: "Серый",
                    bodyType: "Седан"
                }
            })
        },
        {
            name: 'Chevrolet Malibu 2 Premier (Черный)',
            description: 'Классический черный цвет, полный комплект опций. В наличии в Ташкенте.',
            price: 385000000,
            image: '/uploads/malibu_black.png',
            images: JSON.stringify(['/uploads/malibu_black.png']),
            category: 'Седан',
            ownerId: partner.id,
            region: 'Tashkent',
            status: 'APPROVED',
            lat: 41.2995,
            lng: 69.2401,
            attributes: JSON.stringify({
                colors: [
                    { name: 'Белый', hex: '#FFFFFF', image: '/uploads/malibu_white.png' },
                    { name: 'Серый', hex: '#808080', image: '/uploads/malibu_grey.png' },
                    { name: 'Черный', hex: '#000000', image: '/uploads/malibu_black.png' }
                ],
                specs: {
                    year: 2024,
                    mileage: 0,
                    engine: "2.0 Turbo",
                    transmission: "Автомат",
                    color: "Черный",
                    bodyType: "Седан"
                }
            })
        }
    ];

    for (const v of variants) {
        const created = await prisma.marketplace.create({ data: v });
        console.log(`✅ Created: ${created.name}`);
    }

    console.log('🎉 Done!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
