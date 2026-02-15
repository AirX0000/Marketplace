const prisma = require('../config/database');

class SupportService {
    async getTickets(userId, role) {
        const where = {};
        if (role !== 'ADMIN') {
            where.userId = userId;
        }

        return prisma.ticket.findMany({
            where,
            include: { user: { select: { name: true, email: true } } },
            orderBy: { updatedAt: 'desc' }
        });
    }

    async getTicketById(userId, role, ticketId) {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                messages: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
                user: { select: { name: true, email: true } }
            }
        });

        if (!ticket) return null;
        if (role !== 'ADMIN' && ticket.userId !== userId) throw new Error("Access denied");
        return ticket;
    }

    async createTicket(userId, data) {
        const { subject, message, priority } = data;
        return prisma.ticket.create({
            data: {
                userId,
                subject,
                priority: priority || 'NORMAL',
                messages: {
                    create: { message, userId }
                }
            }
        });
    }

    async replyTicket(userId, role, ticketId, message) {
        const isAdmin = role === 'ADMIN';
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) throw new Error("Not found");
        if (!isAdmin && ticket.userId !== userId) throw new Error("Denied");

        const reply = await prisma.ticketMessage.create({
            data: {
                ticketId,
                userId,
                message,
                isAdmin
            }
        });

        await prisma.ticket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date(), status: 'OPEN' }
        });

        return reply;
    }

    async updateStatus(ticketId, status) {
        return prisma.ticket.update({
            where: { id: ticketId },
            data: { status }
        });
    }
}

module.exports = new SupportService();
