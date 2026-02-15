const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { safeUserSelect } = require('../utils/constants');

class UserService {
    async getProfile(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: safeUserSelect
        });
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
}

module.exports = new UserService();
