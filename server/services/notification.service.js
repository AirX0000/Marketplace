const webpush = require('web-push');
const env = require('../config/env');
const prisma = require('../config/database');

// Initialize Web Push
if (env.vapidPublicKey && env.vapidPrivateKey) {
    webpush.setVapidDetails(
        env.vapidMailto || 'mailto:admin@urbandrive.uz',
        env.vapidPublicKey,
        env.vapidPrivateKey
    );
}

class NotificationService {
    async sendPushToUser(userId, payload) {
        if (!env.vapidPublicKey || !env.vapidPrivateKey) {
            console.error('[WebPush] VAPID keys not configured');
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pushSubscriptions: true }
        });

        if (!user || !user.pushSubscriptions || !Array.isArray(user.pushSubscriptions) || user.pushSubscriptions.length === 0) {
            return;
        }

        const validSubscriptions = [];
        let subscriptionsChanged = false;

        const pushPromises = user.pushSubscriptions.map(async (subscription) => {
            try {
                await webpush.sendNotification(subscription, JSON.stringify(payload));
                validSubscriptions.push(subscription);
            } catch (error) {
                if (error.statusCode === 404 || error.statusCode === 410) {
                    // Subscription has expired or is no longer valid
                    console.log(`[WebPush] Subscription expired or removed for user ${userId}`);
                    subscriptionsChanged = true;
                } else {
                    console.error('[WebPush] Error sending notification:', error);
                    validSubscriptions.push(subscription); // Keep it just in case it's a transient error
                }
            }
        });

        await Promise.allSettled(pushPromises);

        // Update DB if we pruned any expired subscriptions
        if (subscriptionsChanged) {
            await prisma.user.update({
                where: { id: userId },
                data: { pushSubscriptions: validSubscriptions }
            });
        }
    }

    async broadcastToAll(payload) {
        if (!env.vapidPublicKey || !env.vapidPrivateKey) {
            console.error('[WebPush] VAPID keys not configured');
            return;
        }

        // Fetch all users and filter those with push subscriptions
        const users = await prisma.user.findMany({
            select: { id: true, pushSubscriptions: true }
        });

        const usersWithPush = users.filter(u => Array.isArray(u.pushSubscriptions) && u.pushSubscriptions.length > 0);

        const promises = usersWithPush.map(user => this.sendPushToUser(user.id, payload));
        await Promise.allSettled(promises);
    }
}

module.exports = new NotificationService();
