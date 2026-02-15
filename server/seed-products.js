// Seed script to create rich Real Estate products
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding products...');

    // Find partner user (Create if not exists for safety)
    let partner = await prisma.user.findFirst({
        where: { role: 'PARTNER' }
    });

    if (!partner) {
        console.log('⚠️ No partner found, creating default partner...');
        partner = await prisma.user.create({
            data: {
                email: 'partner@aura.com',
                password: '$2a$10$YourHashedPasswordHere', // Placeholder if creating simplified
                name: 'Golden House Sales',
                role: 'PARTNER'
            }
        });
    }

    console.log(`✅ Using partner: ${partner.email}`);

    // Helper for random Tashkent coordinates
    function getRandomLocation() {
        const LAT_MIN = 41.26;
        const LAT_MAX = 41.34;
        const LNG_MIN = 69.21;
        const LNG_MAX = 69.33;
        return {
            lat: LAT_MIN + Math.random() * (LAT_MAX - LAT_MIN),
            lng: LNG_MIN + Math.random() * (LNG_MAX - LNG_MIN)
        };
    }

    // Real Estate Products with Rich Attributes
    const products = [
        {
            name: 'Infinity Luxury Residence',
            description: 'Премиальный жилой комплекс в центре города с панорамным видом. Экологичный район, охраняемая территория, подземный паркинг и собственный парк.',
            price: 2450000000,
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
                'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
                'https://images.unsplash.com/photo-1600566753086-00f18cf6b3ea?w=1200&q=80'
            ]),
            category: 'Квартиры',
            ownerId: partner.id,
            region: 'Tashkent City',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    materials: ["Монолитный каркас", "Кирпичное заполнение", "Фасадная плитка"],
                    ceilingHeight: 3.3,
                    yearBuilt: 2024,
                    floor: 12,
                    totalFloors: 16,
                    area: 145,
                    rooms: 4,
                    finishing: "White Box"
                },
                developer: {
                    name: "Golden House",
                    logo: "https://gh.uz/assets/images/logo.svg",
                    description: "Лидер строительного рынка Узбекистана. Более 10 лет успешной работы и 50+ реализованных проектов.",
                    website: "https://gh.uz"
                },
                mortgage: [
                    { bank: "Kapitalbank", rate: 22, term: 10, downPayment: 25, payment: "18.5 млн" },
                    { bank: "Ipak Yuli", rate: 21, term: 15, downPayment: 30, payment: "16.2 млн" },
                    { bank: "Asaka Bank", rate: 20, term: 20, downPayment: 20, payment: "15.8 млн" }
                ],
                documents: [
                    { title: "Генплан территории", url: "#" },
                    { title: "Кадастровый паспорт", url: "#" },
                    { title: "Планировка квартиры", url: "#" }
                ],
                virtualTour: "https://sketchfab.com/models/2c460012224446b2b513368c853f6517/embed",
                floorPlan: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800"
            })
        },
        {
            name: 'Green Valley Cottage',
            description: 'Уютный загородный дом в закрытом поселке. Идеально для семьи: 3 спальни, большой сад, зона барбекю и бассейн.',
            price: 3200000000,
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
                'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=1200&q=80',
                'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80'
            ]),
            category: 'Дома',
            ownerId: partner.id,
            region: 'Tashkent Region',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    materials: ["Клееный брус", "Металлочерепица"],
                    ceilingHeight: 3.0,
                    yearBuilt: 2023,
                    floor: 2,
                    totalFloors: 2,
                    area: 220,
                    rooms: 5,
                    finishing: "Под ключ"
                },
                developer: {
                    name: "Dream Homes",
                    description: "Строим дома вашей мечты с 2015 года. Гарантия качества 50 лет."
                },
                mortgage: [
                    { bank: "SQB", rate: 23, term: 10, downPayment: 30, payment: "25 млн" }
                ],
                virtualTour: "https://sketchfab.com/models/f56f157140834313938994d50eb6822c/embed",
                floorPlan: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800"
            })
        },
        {
            name: 'Modern Loft Studio',
            description: 'Stylish studio in the art district. High ceilings, exposed brick, and modern appliances. Perfect for creatives.',
            price: 950000000,
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
            category: 'Квартиры',
            ownerId: partner.id,
            region: 'Yakkasaray',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    rooms: 1,
                    area: 45,
                    floor: 3,
                    totalFloors: 5,
                    yearBuilt: 2020,
                    finishing: "Дизайнерский ремонт"
                }
            })
        },
        {
            name: 'Family Villa with Pool',
            description: 'Spacious 6-bedroom villa with private pool and garden in a secure location.',
            price: 8500000000,
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
            category: 'Дома',
            ownerId: partner.id,
            region: 'Mirzo Ulugbek',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    rooms: 6,
                    area: 450,
                    floor: 3,
                    totalFloors: 3,
                    yearBuilt: 2021,
                    finishing: "Premium"
                }
            })
        },
        {
            name: 'Chevrolet Malibu 2 Premier',
            description: 'Идеальное состояние, один владелец. Максимальная комплектация Premier. Панорамная крыша, кожаный салон, турбо мотор 2.0.',
            price: 385000000,
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80',
                'https://images.unsplash.com/photo-1549669227-211f23403328?w=1200&q=80',
                'https://images.unsplash.com/photo-1583121274602-3e2820c698d9?w=1200&q=80'
            ]),
            category: 'Седан',
            ownerId: partner.id,
            region: 'Tashkent',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    year: 2023,
                    mileage: 15000,
                    engine: "2.0 Turbo",
                    transmission: "Автомат",
                    color: "Черный",
                    bodyType: "Седан",
                    driveType: "Передний"
                },
                dealer: {
                    name: "AutoCenter Tashkent",
                    address: "Сергели, Авторынок"
                }
            })
        },
        {
            name: 'Kia Seltos Style',
            description: 'Городской кроссовер. Экономичный и стильный. На гарантии.',
            price: 310000000,
            image: 'https://images.unsplash.com/photo-1609529669235-c07e4e1bd6e9?w=1200&q=80',
            category: 'Кроссовер',
            ownerId: partner.id,
            region: 'Samarkand',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    year: 2024,
                    mileage: 500,
                    engine: "1.6 MPI",
                    transmission: "Автомат",
                    color: "Белый Жемчуг",
                    bodyType: "Кроссовер"
                }
            })
        },
        {
            name: 'BMW X5 M-Package',
            description: 'Спортивный внедорожник премиум класса. Полный привод, кожаный салон, панорама, акустика Harman Kardon.',
            price: 1250000000,
            image: 'https://images.unsplash.com/photo-1556189250-72ba95452242?w=1200&q=80',
            category: 'Внедорожник',
            ownerId: partner.id,
            region: 'Tashkent',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    year: 2022,
                    mileage: 25000,
                    engine: "3.0 Diesel",
                    transmission: "Автомат",
                    color: "Синий Металлик",
                    bodyType: "Внедорожник",
                    driveType: "Полный"
                }
            })
        },
        {
            name: 'Toyota Camry 70',
            description: 'Надежный бизнес-седан. Комфорт и престиж. Идеальное состояние.',
            price: 420000000,
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3eb?w=1200&q=80',
            category: 'Седан',
            ownerId: partner.id,
            region: 'Tashkent',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    year: 2021,
                    mileage: 40000,
                    engine: "2.5 Hybrid",
                    transmission: "Вариатор",
                    color: "Белый",
                    bodyType: "Седан",
                    driveType: "Передний"
                }
            })
        },
        {
            name: 'Mercedes-Benz S-Class',
            description: 'Эталон роскоши и технологий. Массажные кресла, пневмоподвеска, ночное видение.',
            price: 2100000000,
            image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80',
            category: 'Седан',
            ownerId: partner.id,
            region: 'Tashkent',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: JSON.stringify({
                specs: {
                    year: 2023,
                    mileage: 5000,
                    engine: "4.0 Biturbo",
                    transmission: "Автомат",
                    color: "Черный Обсидиан",
                    bodyType: "Седан",
                    driveType: "Полный"
                }
            })
        },
        {
            name: 'Samsung Galaxy S24 Ultra',
            description: 'Флагманский смартфон с искусственным интеллектом Galaxy AI.',
            price: 14500000,
            image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
            category: 'Смартфоны',
            ownerId: partner.id,
            region: 'Tashkent',
            status: 'APPROVED',
            ...getRandomLocation(),
            attributes: null
        }
    ];

    console.log('🧹 Clearing old data...');
    // Delete dependencies first to avoid Foreign Key errors
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.marketplace.deleteMany({});

    console.log('📝 Creating new listings...');
    for (const product of products) {
        const created = await prisma.marketplace.create({
            data: product
        });
        console.log(`✅ Created: ${created.name}`);
    }

    console.log('\n🎉 Data seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding products:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
