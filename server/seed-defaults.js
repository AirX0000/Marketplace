const bcrypt = require('bcryptjs');

const seedDefaults = async (prisma) => {
    try {
        // Seed Categories
        const count = await prisma.category.count();
        if (count === 0) {
            console.log("Seeding default categories...");
            const defaults = [
                { name: "Electronics", sub: ["Smartphones", "Laptops", "Headphones"] },
                { name: "Appliances", sub: ["Refrigerators", "Washing Machines", "Vacuums"] },
                { name: "Clothing", sub: ["Men", "Women", "Kids"] },
                { name: "Home & Garden", sub: ["Furniture", "Decor", "Garden"] },
                { name: "Beauty & Health", sub: ["Makeup", "Skincare", "Vitamins"] },
                { name: "Real Estate", sub: ["Apartments", "Houses", "Commercial", "Land"] },
                { name: "Cars", sub: ["Sedan", "SUV", "Truck", "Electric"] },
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

        // Seed Demo Partner & Products
        const mpCount = await prisma.marketplace.count();
        if (mpCount === 0) {
            console.log("Seeding default products...");

            // Ensure we have a partner
            let partner = await prisma.user.findFirst({ where: { role: 'PARTNER' } });
            if (!partner) {
                const hashedPassword = await bcrypt.hash('partner123', 10);
                partner = await prisma.user.create({
                    data: {
                        email: 'demo@partner.com',
                        password: hashedPassword,
                        name: 'Tech World',
                        role: 'PARTNER',
                        storeName: 'Tech World',
                        storeDescription: 'Premier electronics retailer',
                        storeColor: '#3b82f6',
                        accountId: '999999',
                        phone: '+998901234567',
                        isPhoneVerified: true
                    }
                });
            }

            const products = [
                {
                    id: 'm1',
                    name: 'iPhone 15 Pro Max',
                    description: 'Titanium design, A17 Pro chip, 48MP Main camera.',
                    price: 18500000,
                    discount: 5,
                    category: 'Electronics',
                    region: 'Tashkent',
                    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000',
                    isAvailable: true,
                    stock: 50,
                    status: 'APPROVED',
                    ownerId: partner.id
                },
                {
                    id: 'm2',
                    name: 'MacBook Air M2',
                    description: 'Supercharged by M2 chip. Strikingly thin design.',
                    price: 15200000,
                    discount: 10,
                    category: 'Electronics',
                    region: 'Tashkent',
                    image: 'https://images.unsplash.com/photo-1661961110671-77b71b929d52?auto=format&fit=crop&q=80&w=1000',
                    isAvailable: true,
                    stock: 30,
                    status: 'APPROVED',
                    ownerId: partner.id
                },
                {
                    id: 'm3',
                    name: 'BMW X5 2023',
                    description: 'Luxury SUV, Full Option, Low Mileage.',
                    price: 850000000,
                    discount: 0,
                    category: 'Cars',
                    region: 'Tashkent',
                    image: 'https://images.unsplash.com/photo-1555215696-99776b92f398?auto=format&fit=crop&q=80&w=1000',
                    isAvailable: true,
                    stock: 1,
                    status: 'APPROVED',
                    ownerId: partner.id
                }
            ];

            for (const p of products) {
                const exists = await prisma.marketplace.findUnique({ where: { id: p.id } });
                if (!exists) {
                    await prisma.marketplace.create({ data: p });
                }
            }
        }
    } catch (error) {
        console.error("Seeding error:", error);
    }
};

module.exports = { seedDefaults };
