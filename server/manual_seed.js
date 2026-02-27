const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
    try {
        console.log("Checking partner...");
        let partner = await prisma.user.findFirst({ where: { role: 'PARTNER' } });
        if (!partner) {
            console.log("Creating partner...");
            const hashedPassword = await bcrypt.hash('partner123', 10);
            partner = await prisma.user.create({
                data: {
                    email: 'demo@partner.com',
                    password: hashedPassword,
                    name: 'Tech World',
                    role: 'PARTNER',
                    storeName: 'Tech World',
                    storeDescription: 'Premier electronics retailer',
                    storeColor: '#3b82f6'
                }
            });
            console.log("Partner created:", partner.id);
        } else {
            console.log("Partner exists:", partner.id);
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
                status: 'APPROVED',
                ownerId: partner.id,
                attributes: { color: "Natural Titanium", storage: "256GB", brand: "Apple" }
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
                status: 'APPROVED',
                ownerId: partner.id,
                attributes: { color: "Midnight", storage: "512GB", ram: "16GB", brand: "Apple" }
            },
            {
                id: 'm3',
                name: 'Sony WH-1000XM5',
                description: 'Industry-leading noise canceling headphones.',
                price: 4200000,
                discount: 15,
                category: 'Electronics',
                region: 'Global',
                image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000',
                status: 'APPROVED',
                ownerId: partner.id,
                attributes: { color: "Black", type: "Wireless", brand: "Sony" }
            },
            {
                id: 'm4',
                name: 'Nike Air Max 270',
                description: 'Legendary comfort and style.',
                price: 1200000,
                discount: 0,
                category: 'Clothing',
                region: 'Samarkand',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000',
                status: 'APPROVED',
                ownerId: partner.id,
                attributes: { color: "Red", size: "42", brand: "Nike", gender: "Men" }
            }
        ];

        console.log("Seeding products...");
        for (const p of products) {
            const data = { ...p };
            delete data.id; // Don't update ID

            await prisma.marketplace.upsert({
                where: { id: p.id },
                update: { attributes: p.attributes }, // Update attributes at minimum
                create: p
            });
            console.log(`Seeded/Updated ${p.name}`);
        }
    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
