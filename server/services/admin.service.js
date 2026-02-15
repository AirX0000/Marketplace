const prisma = require('../config/database');
const { safeUserSelect } = require('../utils/constants');

class AdminService {
    async getAllUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBlocked: true,
                createdAt: true,
                orders: {
                    select: { id: true, total: true, createdAt: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateUserRole(id, role) {
        return prisma.user.update({
            where: { id },
            data: { role },
            select: safeUserSelect
        });
    }

    async toggleBlockUser(id, isBlocked) {
        return prisma.user.update({
            where: { id },
            data: { isBlocked },
            select: safeUserSelect
        });
    }

    async deleteUser(adminId, userId) {
        if (adminId === userId) throw new Error("Cannot delete yourself");

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { orders: true, marketplaces: { include: { orderItems: true } } }
        });

        if (!user) throw new Error("User not found");
        if (user.orders.length > 0 || user.marketplaces.some(m => m.orderItems.length > 0)) {
            throw new Error("Cannot delete user with history. Block instead.");
        }

        return prisma.$transaction([
            prisma.favorite.deleteMany({ where: { userId } }),
            prisma.review.deleteMany({ where: { userId } }),
            prisma.ticketMessage.deleteMany({ where: { userId } }),
            prisma.ticket.deleteMany({ where: { userId } }),
            prisma.partnerKYC.deleteMany({ where: { userId } }),
            prisma.marketplace.deleteMany({ where: { ownerId: userId } }),
            prisma.user.delete({ where: { id: userId } })
        ]);
    }

    async getMarketplaces(status) {
        const where = status && status !== 'ALL' ? { status } : {};
        return prisma.marketplace.findMany({
            where,
            include: { owner: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteMarketplace(id) {
        const marketplace = await prisma.marketplace.findUnique({
            where: { id },
            include: { orderItems: true }
        });

        if (!marketplace) throw new Error("Product not found");

        // Prevent deletion if there are associated orders for financial record integrity
        if (marketplace.orderItems.length > 0) {
            throw new Error("Cannot delete product with order history. Archive it instead.");
        }

        return prisma.$transaction([
            prisma.favorite.deleteMany({ where: { marketplaceId: id } }),
            prisma.review.deleteMany({ where: { marketplaceId: id } }),
            prisma.offer.deleteMany({ where: { marketplaceId: id } }),
            prisma.marketplace.delete({ where: { id } })
        ]);
    }


    async updateMarketplaceStatus(id, status) {
        return prisma.marketplace.update({
            where: { id },
            data: { status }
        });
    }

    async getStats() {

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const totalUsers = await prisma.user.count();
        const totalPartners = await prisma.user.count({ where: { role: 'PARTNER' } });
        const totalProducts = await prisma.marketplace.count();
        const totalOrders = await prisma.order.count();

        // Simplified for brevity, add full stats logic if needed detailed
        return { totalUsers, totalPartners, totalProducts, totalOrders };
    }
}

module.exports = new AdminService();
