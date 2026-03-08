const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { safeUserSelect } = require('../utils/constants');

class UserService {
    async getProfile(userId) {
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: safeUserSelect
        });

        // Auto-generate accountId if missing
        if (user && !user.accountId) {
            const newId = Math.floor(100000 + Math.random() * 900000).toString();
            user = await prisma.user.update({
                where: { id: userId },
                data: { accountId: newId },
                select: safeUserSelect
            });
        }

        return user;
    }

    async updateProfile(userId, data) {
        // Prevent role/balance updates here
        const { role, balance, isBlocked, ...safeData } = data;

        return prisma.user.update({
            where: { id: userId },
            data: safeData,
            select: safeUserSelect
        });
    }

    async getAddresses(userId) {
        return prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' }
        });
    }

    async addAddress(userId, data) {
        const { isDefault } = data;
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        return prisma.address.create({
            data: { ...data, userId }
        });
    }

    async deleteAddress(userId, addressId) {
        return prisma.address.deleteMany({
            where: { id: addressId, userId }
        });
    }

    async getSharedFavorites(targetUserId) {
        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { isWishlistPublic: true, name: true, avatar: true }
        });

        if (!user || !user.isWishlistPublic) {
            throw new Error("Wishlist is private or user not found");
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: targetUserId },
            include: {
                marketplace: true
            }
        });

        return { user, favorites: favorites.map(f => f.marketplace) };
    }

    async toggleWishlistPrivacy(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isWishlistPublic: true }
        });

        return prisma.user.update({
            where: { id: userId },
            data: { isWishlistPublic: !user.isWishlistPublic },
            select: { isWishlistPublic: true }
        });
    }

    // Virtual Garage Methods
    async getGarageCars(userId) {
        return prisma.userCar.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async addGarageCar(userId, data) {
        return prisma.userCar.create({
            data: {
                ...data,
                userId
            }
        });
    }

    async deleteGarageCar(userId, carId) {
        return prisma.userCar.deleteMany({
            where: {
                id: carId,
                userId
            }
        });
    }

    // Price Drop Watch & Push Notifications
    async toggleWatchPrice(userId, marketplaceId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { watchedListings: true }
        });

        let watched = JSON.parse(user.watchedListings || "[]");
        let isWatching = false;

        if (watched.includes(marketplaceId)) {
            watched = watched.filter(id => id !== marketplaceId);
        } else {
            watched.push(marketplaceId);
            isWatching = true;
        }

        await prisma.user.update({
            where: { id: userId },
            data: { watchedListings: JSON.stringify(watched) }
        });

        return { isWatching, watched };
    }

    async savePushSubscription(userId, subscription) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pushSubscriptions: true }
        });

        let subs = user.pushSubscriptions || [];
        if (!Array.isArray(subs)) subs = [];

        // Add if not exists
        const exists = subs.find(s => s.endpoint === subscription.endpoint);
        if (!exists) {
            subs.push(subscription);
            await prisma.user.update({
                where: { id: userId },
                data: { pushSubscriptions: subs }
            });
        }

        return { success: true };
    }

    async getRecommendations(userId) {
        const cars = await prisma.userCar.findMany({ where: { userId } });

        let recommended = [];

        if (cars.length > 0) {
            const searchTerms = cars.flatMap(c => [c.brand, c.model]).filter(Boolean);
            if (searchTerms.length > 0) {
                recommended = await prisma.marketplace.findMany({
                    where: {
                        status: 'APPROVED',
                        OR: searchTerms.map(term => ({
                            OR: [
                                { name: { contains: term, mode: 'insensitive' } },
                                { description: { contains: term, mode: 'insensitive' } }
                            ]
                        }))
                    },
                    take: 8,
                    orderBy: { views: 'desc' },
                    include: { owner: { select: { id: true, name: true, storeName: true, isVerified: true } } }
                });
            }
        }

        // Fallback to popular items
        if (recommended.length < 8) {
            const extra = await prisma.marketplace.findMany({
                where: {
                    status: 'APPROVED',
                    id: { notIn: recommended.map(r => r.id) }
                },
                take: 8 - recommended.length,
                orderBy: { views: 'desc' },
                include: { owner: { select: { id: true, name: true, storeName: true, isVerified: true } } }
            });
            recommended = [...recommended, ...extra];
        }

        return recommended;
    }
}

module.exports = new UserService();
