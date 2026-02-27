const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReviewService {
    async createReview(userId, marketplaceId, data) {
        return await prisma.review.create({
            data: {
                rating: parseInt(data.rating),
                comment: data.comment,
                userId: userId,
                marketplaceId: marketplaceId
            },
            include: {
                user: {
                    select: { name: true, avatar: true }
                }
            }
        });
    }

    async getMarketplaceReviews(marketplaceId) {
        return await prisma.review.findMany({
            where: { marketplaceId },
            include: {
                user: {
                    select: { name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteReview(userId, reviewId) {
        // Only allow deleting own reviews
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review || review.userId !== userId) {
            throw new Error('Unauthorized or not found');
        }
        return await prisma.review.delete({ where: { id: reviewId } });
    }
}

module.exports = new ReviewService();
