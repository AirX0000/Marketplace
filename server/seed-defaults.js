const bcrypt = require('bcryptjs');

const seedDefaults = async (prisma) => {
    try {
        const allowedCategories = ['Transport', 'Real Estate'];

        console.log("🧹 Purging non-compliant categories and products...");
        // 1. Delete products in non-allowed categories
        await prisma.marketplace.deleteMany({
            where: {
                category: {
                    notIn: allowedCategories
                }
            }
        });

        // 2. Delete non-allowed categories
        await prisma.category.deleteMany({
            where: {
                name: {
                    notIn: allowedCategories
                }
            }
        });

        // Seed Categories
        const count = await prisma.category.count();
        if (count === 0) {
            console.log("Seeding default categories...");
            const defaults = [
                { name: "Real Estate", sub: ["Apartments", "Houses", "Commercial", "Land"] },
                { name: "Transport", sub: ["Premium", "SUV", "Sedan", "Commercial"] },
            ];
            for (const cat of defaults) {
                await prisma.category.create({
                    data: { name: cat.name, subcategories: JSON.stringify(cat.sub) }
                });
            }
        }

        // Seed Regions
        const regionCount = await prisma.region.count();
        if (regionCount === 0) {
            console.log("Seeding default regions...");
            const regions = ["Global", "North America", "Europe", "Asia", "Tashkent", "Samarkand"];
            for (const r of regions) {
                await prisma.region.create({ data: { name: r } });
            }
        }

        // Seed System Settings
        const settingsCount = await prisma.systemSetting.count();
        if (settingsCount === 0) {
            console.log("Seeding default settings...");
            await prisma.systemSetting.createMany({
                data: [
                    { key: 'enable_installments', value: 'true' },
                    { key: 'installment_months', value: '3,6,12' },
                    { key: 'interest_rate', value: '0' }, // 0%
                ]
            });
        }

        // Seed Main Admin
        const adminEmail = 'admin@aura.com';
        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log("Ensuring main admin exists with correct credentials...");
        await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                role: 'ADMIN',
                password: hashedPassword
            },
            create: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Главный Администратор',
                role: 'ADMIN'
            }
        });

        // Seed Demo Partner & Products
        // We always upsert core products to ensure rich metadata ('UrbanDrive' style) is applied
        console.log("Seeding/Updating core products...");

        // Ensure we have partners from TEST_USERS.md
        const partners = [
            {
                email: 'partner@aura.com',
                password: 'password123',
                name: 'TechStore Uzbekistan',
                role: 'PARTNER',
                storeName: 'TechStore UZ',
                storeDescription: 'Официальный дилер Apple, Samsung, Xiaomi в Узбекистане',
                storeColor: '#10b981'
            },
            {
                email: 'fashion.partner@aura.com',
                password: 'password123',
                name: 'Fashion House Tashkent',
                role: 'PARTNER',
                storeName: 'Fashion House',
                storeDescription: 'Брендовая одежда и аксессуары из Европы',
                storeColor: '#ec4899'
            }
        ];

        let partnerId;
        for (const pData of partners) {
            console.log(`Ensuring partner ${pData.email} exists...`);
            const p = await prisma.user.upsert({
                where: { email: pData.email },
                update: {
                    role: 'PARTNER',
                    password: hashedPassword,
                    isPhoneVerified: true
                },
                create: {
                    ...pData,
                    password: hashedPassword,
                    isPhoneVerified: true
                }
            });
            partnerId = p.id;
        }

        const partner = { id: partnerId };

        const products = [
            {
                id: 'house-1',
                name: 'Современная Вилла в Ташкенте',
                description: 'Роскошная вилла с бассейном и видом на горы. 5 спален, современный дизайн, высококачественные материалы отделки. Идеальное место для жизни и отдыха.',
                price: 2450000000,
                discount: 0,
                category: 'Real Estate',
                region: 'Tashkent',
                image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000',
                isAvailable: true,
                stock: 1,
                status: 'APPROVED',
                ownerId: partner.id,
                specs: {
                    area: "450",
                    rooms: "7",
                    floor: "2",
                    totalFloors: "2",
                    yearBuilt: "2023",
                    renovation: "Авторский проект",
                    materials: ["Кирпич", "Бетон", "Стекло"],
                    features: ["Бассейн", "Сауна", "Гараж", "Охрана"]
                }
            },
            {
                id: 'house-2',
                name: 'Пентхаус в центре города',
                description: 'Эксклюзивный пентхаус с панорамным видом на город. Высокие потолки, терраса, система "Умный дом".',
                price: 1850000000,
                discount: 5,
                category: 'Real Estate',
                region: 'Tashkent',
                image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000',
                isAvailable: true,
                stock: 1,
                status: 'APPROVED',
                ownerId: partner.id,
                specs: {
                    area: "210",
                    rooms: "4",
                    floor: "12",
                    totalFloors: "12",
                    yearBuilt: "2022",
                    renovation: "Hi-Tech",
                    materials: ["Монолит"],
                    features: ["Терраса", "Умный дом", "Паркинг"]
                }
            },
            {
                id: 'car-1',
                name: 'BMW X5 M-Selection 2023',
                description: 'Luxury SUV in perfect condition. Full M-Package, panoramic roof, Bowers & Wilkins sound system. One owner. High performance meets ultimate comfort.',
                price: 850000000,
                discount: 0,
                category: 'Transport',
                region: 'Tashkent',
                image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1000',
                isAvailable: true,
                stock: 1,
                status: 'APPROVED',
                ownerId: partner.id,
                attributes: {
                    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
                    modifications: [
                        { name: 'xDrive40i M-Sport', price: 850000000, features: ['3.0L I6', 'M-Aerodynamics', '20" Wheels'] },
                        { name: 'xDrive50e PHEV', price: 1020000000, features: ['Electric + Petrol', '90km Sky EV', 'Air Suspension'] },
                        { name: 'M60i V8 Performance', price: 1250000000, features: ['4.4L V8 TwinTurbo', 'M-Sport Diff', 'Nappa Leather'] }
                    ],
                    colors: [
                        { name: 'Carbon Black', hex: '#000000' },
                        { name: 'Mineral White', hex: '#F0F0F0' },
                        { name: 'Phytonic Blue', hex: '#003366' },
                        { name: 'Dravit Grey', hex: '#4A4E4E' }
                    ],
                    specs: {
                        acceleration: '5.5 сек',
                        range: '800 км',
                        year: '2023',
                        mileage: "5000",
                        engine: "3.0L xDrive40i",
                        transmission: "Автомат",
                        drive: "Полный (AWD)",
                        bodyType: "Кроссовер",
                        fuelConsumption: "9.2 л/100км",
                        power: "340 л.с."
                    },
                    features: ["M-Package", "Адаптивные фары", "Apple CarPlay", "Bowers & Wilkins"]
                }
            },
            {
                id: 'car-2',
                name: 'Tesla Model Y Long Range',
                description: 'Электрический кроссовер с запасом хода до 530 км. Автопилот, кожаный салон, панорамная крыша. Минимум обслуживания, максимум технологий.',
                price: 620000000,
                discount: 0,
                category: 'Transport',
                region: 'Tashkent',
                image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000',
                isAvailable: true,
                stock: 5,
                status: 'APPROVED',
                ownerId: partner.id,
                attributes: {
                    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg',
                    modifications: [
                        { name: 'Long Range AWD', price: 620000000, features: ['Dual Motor', '19" Gemini', '533km Range'] },
                        { name: 'Performance Edition', price: 740000000, features: ['Überpower', '21" Überturbine', '3.7s 0-100'] },
                        { name: 'Standard RWD', price: 540000000, features: ['Single Motor', 'Efficient', '455km Range'] }
                    ],
                    colors: [
                        { name: 'Pearl White', hex: '#FFFFFF' },
                        { name: 'Solid Black', hex: '#000000' },
                        { name: 'Midnight Silver', hex: '#707070' },
                        { name: 'Deep Blue', hex: '#003399' },
                        { name: 'Ultra Red', hex: '#A50000' }
                    ],
                    specs: {
                        acceleration: '5.0 сек',
                        range: '533 км',
                        year: '2024',
                        mileage: "0",
                        engine: "Electric (Dual Motor)",
                        transmission: "Редуктор",
                        drive: "Полный (AWD)",
                        bodyType: "Кроссовер",
                        fuelConsumption: "0 л/100км",
                        power: "514 л.с."
                    },
                    features: ["Автопилот", "Панорама", "Премиальная музыка", "Heat Pump"]
                }
            },
            {
                id: 'car-3',
                name: 'Li Auto L9 Ultra',
                description: 'Флагманский 6-местный семейный внедорожник. Оснащен передовыми системами помощи водителю, 5 экранами и пневмоподвеской Magic Carpet.',
                price: 880000000,
                discount: 0,
                category: 'Transport',
                region: 'Tashkent',
                id: 'car-3',
                image: 'https://images.unsplash.com/photo-1621243804936-775306a8f2e3?auto=format&fit=crop&q=80&w=1000',
                isAvailable: true,
                stock: 2,
                status: 'APPROVED',
                ownerId: partner.id,
                attributes: {
                    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Li_Auto_logo.svg',
                    modifications: [
                        { name: 'L9 Ultra 2024', price: 880000000, features: ['Full Option', '21" Special Wheels', 'Nappa Comfort'] },
                        { name: 'L9 Max', price: 820000000, features: ['Standard Tech', '20" Wheels', 'Fridge Included'] }
                    ],
                    colors: [
                        { name: 'Purple Metallic', hex: '#4B0082' },
                        { name: 'Day Green', hex: '#2F4F4F' },
                        { name: 'Gold', hex: '#D4AF37' },
                        { name: 'Classic Black', hex: '#000000' }
                    ],
                    specs: {
                        acceleration: '5.3 сек',
                        range: '1315 км (CLTC)',
                        year: '2024',
                        mileage: "0",
                        engine: "1.5T Range Extender",
                        transmission: "Редуктор",
                        drive: "Полный (AWD)",
                        bodyType: "SUV",
                        fuelConsumption: "5.9 л/100км",
                        power: "449 л.с."
                    },
                    features: ["5 Экранов", "Холодильник", "Массаж всех кресел", "Lidar 2.0"]
                }
            }
        ];

        for (const p of products) {
            console.log(`Upserting product: ${p.name}`);
            await prisma.marketplace.upsert({
                where: { id: p.id },
                update: p,
                create: p
            });
        }
    } catch (error) {
        console.error("Seeding error:", error);
    }
};

module.exports = { seedDefaults };
