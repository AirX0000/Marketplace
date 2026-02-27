const prisma = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class FavoritesService {
    async getFavorites(userId) {
        return await prisma.favorite.findMany({
            where: { userId },
            include: {
                marketplace: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        discount: true,
                        image: true,
                        rating: true,
                        stock: true,
                        isAvailable: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async addFavorite(userId, marketplaceId) {
        // Ensure marketplace exists
        const marketplace = await prisma.marketplace.findUnique({ where: { id: marketplaceId } });
        if (!marketplace) throw new NotFoundError('Marketplace item');

        return await prisma.favorite.upsert({
            where: {
                userId_marketplaceId: { userId, marketplaceId }
            },
            update: {},
            create: { userId, marketplaceId }
        });
    }

    async removeFavorite(userId, marketplaceId) {
        try {
            await prisma.favorite.delete({
                where: {
                    userId_marketplaceId: { userId, marketplaceId }
                }
            });
            return { success: true };
        } catch (error) {
            // If it doesn't exist, we don't necessarily need to throw error, just success
            return { success: true };
        }
    }
}

module.exports = new FavoritesService();
