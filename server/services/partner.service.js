const prisma = require('../config/database');
const emailService = require('../emailService');
const { slugify } = require('../utils/slugify');

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
        // KYC Check - Only for professional PARTNER role
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            include: { kyc: true }
        });

        if (user.role === 'PARTNER' && (!user.kyc || user.kyc.status !== 'APPROVED')) {
            throw new Error("Ваша учетная запись партнера еще не прошла верификацию (KYC). Добавление товаров временно заблокировано.");
        }

        const { name, description, region, category, price, discount, image, images, attributes, specs, videoUrl, panoramaUrl, lat, lng, certificates } = data;

        let finalAttributes = attributes || {};
        if (typeof finalAttributes === 'string') {
            try { finalAttributes = JSON.parse(finalAttributes); } catch (e) { finalAttributes = {}; }
        }

        const parsedLat = (lat !== undefined && lat !== null && lat !== "") ? parseFloat(lat) : null;
        const parsedLng = (lng !== undefined && lng !== null && lng !== "") ? parseFloat(lng) : null;

        // Robust Image Parsing
        let imageList = [];
        let inputImages = images;
        if (typeof inputImages === 'string' && inputImages.startsWith('[')) {
            try { inputImages = JSON.parse(inputImages); } catch (e) { console.error("Failed to parse images string", e); }
        }

        if (Array.isArray(inputImages) && inputImages.length > 0) {
            imageList = inputImages;
        } else if (image) {
            imageList = [image];
        } else {
            imageList = ["https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000"];
        }

        let baseSlug = slugify(name) || 'product';
        const uniqueSuffix = Math.random().toString(36).substring(2, 8);
        const slug = `${baseSlug}-${uniqueSuffix}`;

        const newListing = await prisma.marketplace.create({
            data: {
                slug,
                name,
                description,
                videoUrl,
                panoramaUrl,
                region,
                category,
                price: parseFloat(price) || 0,
                discount: parseFloat(discount) || 0,
                ownerId: userId,
                image: imageList[0],
                images: JSON.stringify(imageList),
                attributes: finalAttributes,
                specs: specs || {},
                certificates: certificates || [],
                lat: isNaN(parsedLat) ? null : parsedLat,
                lng: isNaN(parsedLng) ? null : parsedLng,
                stock: 1,
                status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'
            }
        });

        // Record initial price in history
        await prisma.priceHistory.create({
            data: {
                marketplaceId: newListing.id,
                price: newListing.price
            }
        });

        return newListing;
    }

    async updateListing(userId, role, listingId, data) {
        const listing = await prisma.marketplace.findUnique({ where: { id: listingId } });
        if (!listing) throw new Error("Listing not found");

        if (listing.ownerId !== userId && role !== 'ADMIN') {
            throw new Error("Unauthorized");
        }

        const { name, description, region, category, price, discount, image, images, attributes, specs, videoUrl, panoramaUrl, lat, lng, certificates } = data;

        const dataToUpdate = { name, description, region, category };
        if (videoUrl !== undefined) dataToUpdate.videoUrl = videoUrl;
        if (panoramaUrl !== undefined) dataToUpdate.panoramaUrl = panoramaUrl;

        // Robust Image Handling for Updates
        let inputImages = images;
        if (typeof inputImages === 'string' && inputImages.startsWith('[')) {
            try { inputImages = JSON.parse(inputImages); } catch (e) { console.error("Failed to parse images string update", e); }
        }

        if (Array.isArray(inputImages)) {
            dataToUpdate.images = JSON.stringify(inputImages);
            if (inputImages.length > 0) dataToUpdate.image = inputImages[0];
        } else if (image) {
            dataToUpdate.image = image;
            dataToUpdate.images = JSON.stringify([image]);
        }

        if (lat !== undefined) dataToUpdate.lat = parseFloat(lat);
        if (lng !== undefined) dataToUpdate.lng = parseFloat(lng);
        if (certificates !== undefined) dataToUpdate.certificates = certificates;

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

        const updatedListing = await prisma.marketplace.update({
            where: { id: listingId },
            data: dataToUpdate
        });

        // Record price history if price changed
        if (dataToUpdate.price !== undefined && dataToUpdate.price !== listing.price) {
            await prisma.priceHistory.create({
                data: {
                    marketplaceId: listingId,
                    price: dataToUpdate.price
                }
            });

            // Notify about price drop
            if (dataToUpdate.price < listing.price) {
                this.notifyPriceDrop(updatedListing, dataToUpdate.price).catch(e => console.error("[Price Drop Notify Error]:", e.message));
            }
        }

        return updatedListing;
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
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const listingsCount = await prisma.marketplace.count({ where: { ownerId: userId } });

        const orderItems = await prisma.orderItem.findMany({
            where: {
                marketplace: { ownerId: userId },
                order: { createdAt: { gte: thirtyDaysAgo } }
            },
            include: { order: true, marketplace: true },
            orderBy: { order: { createdAt: 'desc' } }
        });

        // Calculate Daily Sales for Chart
        const dailySales = {};
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailySales[dateStr] = 0;
        }

        orderItems.forEach(item => {
            const dateStr = item.order.createdAt.toISOString().split('T')[0];
            if (dailySales[dateStr] !== undefined) {
                dailySales[dateStr] += item.price;
            }
        });

        const chartData = Object.entries(dailySales)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const totalRevenue = orderItems.reduce((acc, item) => acc + item.price, 0);
        const totalOrders = orderItems.length;

        return {
            listings: listingsCount,
            revenue: totalRevenue,
            orders: totalOrders,
            chartData,
            recentActivity: orderItems.slice(0, 5).map(item => ({
                id: item.id,
                productName: item.marketplace.name,
                price: item.price,
                date: item.order.createdAt
            }))
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

    async notifyPriceDrop(listing, newPrice) {
        try {
            // Find users watching this listing
            // watchedListings is a JSON string array of IDs
            const users = await prisma.user.findMany({
                where: {
                    watchedListings: {
                        contains: listing.id
                    }
                },
                select: { id: true }
            });

            if (users.length === 0) return;

            console.log(`[PriceDrop] Notifying ${users.length} users about ${listing.name} price drop to ${newPrice}`);

            if (global.io) {
                users.forEach(user => {
                    global.io.to(user.id).emit('price_drop', {
                        listingId: listing.id,
                        name: listing.name,
                        oldPrice: listing.price,
                        newPrice: newPrice
                    });
                });
            }
        } catch (error) {
            console.error("[notifyPriceDrop] Error:", error);
        }
    }
}

module.exports = new PartnerService();
