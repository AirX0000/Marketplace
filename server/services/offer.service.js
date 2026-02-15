const prisma = require('../config/database');
const emailService = require('../emailService');

class OfferService {
    async createOffer(userId, data) {
        const { marketplaceId, amount } = data;
        const offer = await prisma.offer.create({
            data: {
                userId,
                marketplaceId,
                amount: parseFloat(amount),
                status: 'PENDING'
            },
            include: {
                marketplace: { include: { owner: true } },
                user: true
            }
        });

        // Send email to seller
        if (offer.marketplace && offer.marketplace.owner && offer.marketplace.owner.email) {
            emailService.sendOfferEmail(
                'CREATED',
                offer,
                offer.marketplace,
                offer.user,
                offer.marketplace.owner.email
            ).catch(console.error);
        }

        return offer;
    }

    async getUserOffers(userId) {
        return prisma.offer.findMany({
            where: { userId },
            include: { marketplace: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getPartnerOffers(userId) {
        return prisma.offer.findMany({
            where: {
                marketplace: { ownerId: userId }
            },
            include: {
                marketplace: true,
                user: { select: { id: true, name: true, phone: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateOfferStatus(userId, offerId, status, counterAmount) {
        const offer = await prisma.offer.findUnique({
            where: { id: offerId },
            include: {
                marketplace: true,
                user: true // Include buyer for email
            }
        });

        if (!offer) throw new Error("Offer not found");
        if (offer.marketplace.ownerId !== userId) throw new Error("Not authorized");

        const updatedOffer = await prisma.offer.update({
            where: { id: offerId },
            data: { status, counterAmount }
        });

        // Send email to buyer
        if (offer.user && offer.user.email) {
            emailService.sendOfferEmail(
                'STATUS_UPDATE',
                updatedOffer,
                offer.marketplace,
                null, // No related user needed for status update
                offer.user.email
            ).catch(console.error);
        }

        return updatedOffer;
    }
}

module.exports = new OfferService();
