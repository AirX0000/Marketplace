const prisma = require('../config/database');
const emailService = require('../emailService');

class PartnerService {
    async getPartner(id) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                storeName: true,
                storeDescription: true,
                storeLogo: true,
                storeBanner: true,
                storeColor: true,
                marketplaces: true
            }
        });
    }

    async createListing(userId, data) {
        // KYC Check
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.kycStatus !== 'APPROVED') {
            throw new Error("Ваша учетная запись партнера еще не прошла верификацию (KYC). Добавление товаров временно заблокировано.");
        }

        const { name, description, region, category, price, discount, image, images, attributes, specs } = data;

        let imageList = [];
        if (Array.isArray(images) && images.length > 0) imageList = images;
        else if (image) imageList = [image];
        else imageList = ["https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000"];

        return prisma.marketplace.create({
            data: {
                name,
                description,
                region,
                category,
                price: parseFloat(price) || 0,
                discount: parseFloat(discount) || 0,
                ownerId: userId,
                image: imageList[0],
                images: JSON.stringify(imageList),
                attributes: attributes || {}, // Prisma now handles Json directly
                specs: specs || {},
                stock: 1,
                status: 'PENDING'
            }
        });
    }

    async updateListing(userId, role, listingId, data) {
        const listing = await prisma.marketplace.findUnique({ where: { id: listingId } });
        if (!listing) throw new Error("Listing not found");

        if (listing.ownerId !== userId && role !== 'ADMIN') {
            throw new Error("Unauthorized");
        }

        const { name, description, region, category, price, discount, image, images, attributes, specs } = data;

        const dataToUpdate = { name, description, region, category };

        // Handle Images
        if (Array.isArray(images)) {
            dataToUpdate.images = JSON.stringify(images);
            if (images.length > 0) dataToUpdate.image = images[0];
        } else if (image) {
            dataToUpdate.image = image;
            dataToUpdate.images = JSON.stringify([image]);
        }

        const parsedPrice = parseFloat(price);
        if (!isNaN(parsedPrice)) dataToUpdate.price = parsedPrice;

        const parsedDiscount = parseFloat(discount);
        if (!isNaN(parsedDiscount)) dataToUpdate.discount = parsedDiscount;

        let finalAttributes = attributes || {};
        if (typeof finalAttributes === 'string') {
            try { finalAttributes = JSON.parse(finalAttributes); } catch (e) { finalAttributes = {}; }
        }

        if (specs) {
            finalAttributes.specs = typeof specs === 'string' ? JSON.parse(specs) : specs;
        }

        if (Object.keys(finalAttributes).length > 0) {
            dataToUpdate.attributes = finalAttributes;
        }

        return prisma.marketplace.update({
            where: { id: listingId },
            data: dataToUpdate
        });
    }

    async deleteListing(userId, listingId) {
        const listing = await prisma.marketplace.findFirst({
            where: { id: listingId, ownerId: userId }
        });
        if (!listing) throw new Error("Listing not found or unauthorized");
        return prisma.marketplace.delete({ where: { id: listingId } });
    }

    async getListings(userId) {
        return prisma.marketplace.findMany({ where: { ownerId: userId } });
    }

    async getOrders(userId) {
        return prisma.orderItem.findMany({
            where: { marketplace: { ownerId: userId } },
            include: {
                order: { include: { user: true } },
                marketplace: true
            },
            orderBy: { order: { createdAt: 'desc' } }
        });
    }

    async getCustomers(userId) {
        const orderItems = await prisma.orderItem.findMany({
            where: { marketplace: { ownerId: userId } },
            include: { order: { include: { user: true } } }
        });

        const customerMap = new Map();
        orderItems.forEach(item => {
            const user = item.order.user;
            if (!customerMap.has(user.id)) {
                customerMap.set(user.id, {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    totalSpent: 0,
                    ordersCount: 0,
                    lastOrderDate: item.order.createdAt
                });
            }
            const customer = customerMap.get(user.id);
            customer.totalSpent += item.price;
            customer.ordersCount += 1;
            if (new Date(item.order.createdAt) > new Date(customer.lastOrderDate)) {
                customer.lastOrderDate = item.order.createdAt;
            }
        });
        return Array.from(customerMap.values());
    }

    async updateOrderItemStatus(userId, itemId, status) {
        const item = await prisma.orderItem.findUnique({
            where: { id: itemId },
            include: { marketplace: true }
        });

        if (!item) throw new Error("Item not found");
        if (item.marketplace.ownerId !== userId) throw new Error("Unauthorized");

        const updatedItem = await prisma.orderItem.update({
            where: { id: itemId },
            data: { status },
            include: {
                order: { include: { user: true } },
                marketplace: true
            }
        });

        emailService.sendOrderStatusUpdate(updatedItem, status, updatedItem.order.user).catch(console.error);
        return updatedItem;
    }

    async getStats(userId) {
        const listingsCount = await prisma.marketplace.count({ where: { ownerId: userId } });
        const orderItems = await prisma.orderItem.findMany({
            where: { marketplace: { ownerId: userId } },
            include: { order: { include: { user: true } }, marketplace: true },
            orderBy: { order: { createdAt: 'desc' } }
        });

        const totalRevenue = orderItems.reduce((acc, item) => acc + item.price, 0);
        const totalOrders = orderItems.length;
        const uniqueCustomers = new Set(orderItems.map(item => item.order.userId));
        const activeUsersCount = uniqueCustomers.size;

        const recentActivity = orderItems.slice(0, 5).map(item => ({
            id: item.id,
            productName: item.marketplace.name,
            buyerName: item.order.user.name || "Anonymous",
            price: item.price,
            date: item.order.createdAt
        }));

        return {
            listings: listingsCount,
            revenue: totalRevenue,
            orders: totalOrders,
            activeUsers: activeUsersCount,
            recentActivity
        };
    }

    async getFinance(userId) {
        const marketplaces = await prisma.marketplace.findMany({
            where: { ownerId: userId },
            select: { id: true }
        });
        const mpIds = marketplaces.map(m => m.id);

        const orderItems = await prisma.orderItem.findMany({
            where: { marketplaceId: { in: mpIds } },
            include: { order: true }
        });

        const totalRevenue = orderItems.reduce((sum, item) => sum + item.price, 0);
        return {
            balance: totalRevenue * 0.9, // 10% platform fee deduction (Simulated)
            pendingPayout: 0,
            transactions: []
        };
    }
}

module.exports = new PartnerService();
