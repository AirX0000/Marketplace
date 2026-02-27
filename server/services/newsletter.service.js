console.log('🔹 [NewsletterService] Requiring database...');
const prisma = require('../config/database');
console.log('🔹 [NewsletterService] Requiring emailService...');
const { sendBulkEmail } = require('../emailService');
console.log('🔹 [NewsletterService] Imports done.');

class NewsletterService {
    async sendBroadcast(subject, message, targetRole) {
        let users = [];
        if (targetRole === 'ALL') {
            users = await prisma.user.findMany({ where: { isBlocked: false } });
        } else {
            // Prisma enum or string check
            users = await prisma.user.findMany({ where: { role: targetRole, isBlocked: false } });
        }

        const recipients = users.map(u => u.email).filter(Boolean);
        if (recipients.length === 0) return 0;

        const sentCount = await sendBulkEmail(recipients, subject, message);

        await prisma.newsletter.create({
            data: {
                subject,
                message,
                targetRole,
                recipientCount: sentCount,
                status: 'SENT'
            }
        });

        return sentCount;
    }

    async getStats() {
        const totalUsers = await prisma.user.count();
        const activePartners = await prisma.user.count({ where: { role: 'PARTNER', isBlocked: false } });
        const subscribers = await prisma.user.count({ where: { isBlocked: false } });

        return { totalUsers, activePartners, subscribers };
    }

    async getHistory() {
        return prisma.newsletter.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    }
}

module.exports = new NewsletterService();
