const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { safeUserSelect } = require('../utils/constants');

class AdminService {
    async createUser(userData) {
        const { email, phone, name, password, role, isPhoneVerified } = userData;

        const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
        const normalizedPhone = phone ? phone.replace(/\D/g, '') : undefined;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    normalizedEmail ? { email: { equals: normalizedEmail, mode: 'insensitive' } } : undefined,
                    normalizedPhone ? { phone: normalizedPhone } : undefined
                ].filter(Boolean)
            }
        });

        if (existingUser) {
            throw new Error("User with this email or phone already exists");
        }

        // Generate accountId
        const lastUser = await prisma.user.findFirst({
            orderBy: { accountId: 'desc' },
            where: { accountId: { not: null } }
        });

        let nextAccountId = "1";
        if (lastUser && lastUser.accountId) {
            nextAccountId = (parseInt(lastUser.accountId) + 1).toString();
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        return prisma.user.create({
            data: {
                email: normalizedEmail,
                phone: normalizedPhone,
                name,
                password: hashedPassword,
                role: role || 'USER',
                isPhoneVerified: !!isPhoneVerified,
                accountId: nextAccountId
            },
            select: safeUserSelect
        });
    }

    async getAllUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
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

        const [totalUsers, totalPartners, totalProducts, totalOrders] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'PARTNER' } }),
            prisma.marketplace.count(),
            prisma.order.count(),
        ]);

        // Active users (created in last 30 days)
        const activeUsers = await prisma.user.count({
            where: { createdAt: { gte: startDate } }
        });

        // Revenue from orders
        const orders = await prisma.order.findMany({
            where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } },
            select: { total: true, createdAt: true }
        });

        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const recentRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

        // Build daily revenue chart for last 30 days
        const revenueChart = [];
        for (let i = 29; i >= 0; i--) {
            const day = new Date();
            day.setDate(day.getDate() - i);
            day.setHours(0, 0, 0, 0);
            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);

            const dayOrders = orders.filter(o => {
                const d = new Date(o.createdAt);
                return d >= day && d < nextDay;
            });

            revenueChart.push({
                date: day.toISOString(),
                amount: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
            });
        }

        // Sales by category
        const marketplaces = await prisma.marketplace.findMany({
            select: { category: true }
        });
        const categoryCount = {};
        for (const m of marketplaces) {
            categoryCount[m.category] = (categoryCount[m.category] || 0) + 1;
        }
        const salesByCategory = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

        // Top partners by listing count
        const partners = await prisma.user.findMany({
            where: { role: 'PARTNER' },
            select: {
                id: true,
                name: true,
                _count: { select: { marketplaces: true } }
            },
            orderBy: { marketplaces: { _count: 'desc' } },
            take: 5
        });
        const topPartners = partners.map(p => ({
            id: p.id,
            name: p.name,
            revenue: 0,
            listings: p._count.marketplaces
        }));

        return {
            totalUsers,
            totalPartners,
            totalProducts,
            totalOrders,
            activeUsers,
            totalRevenue,
            recentRevenue,
            revenueChart,
            salesByCategory,
            topPartners,
            topProducts: [],
            recentActivity: []
        };
    }
}

module.exports = new AdminService();

