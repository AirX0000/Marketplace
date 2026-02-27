const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get Admin Stats
router.get('/stats', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    try {
        const totalRevenue = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { in: ['PAID', 'COMPLETED', 'SHIPPED'] } }
        });

        const platformCommission = await prisma.order.aggregate({
            _sum: { commission: true },
            where: { status: { in: ['PAID', 'COMPLETED', 'SHIPPED'] } }
        });

        const pendingPayouts = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: 'SALE', status: 'PENDING' }
        });

        res.json({
            totalRevenue: totalRevenue._sum.total || 0,
            platformCommission: platformCommission._sum.commission || 0,
            pendingPayouts: pendingPayouts._sum.amount || 0
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// Get Pending Deposits
router.get('/deposits/pending', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    try {
        const deposits = await prisma.transaction.findMany({
            where: {
                type: 'DEPOSIT',
                status: 'PENDING'
            },
            include: {
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(deposits);
    } catch (error) {
        console.error('Error fetching pending deposits:', error);
        res.status(500).json({ error: 'Failed to fetch deposits' });
    }
});

// Approve Deposit
router.post('/deposits/approve', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { transactionId } = req.body;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get Transaction
            const transaction = await tx.transaction.findUnique({
                where: { id: transactionId }
            });

            if (!transaction) throw new Error("Transaction not found");
            if (transaction.status !== 'PENDING') throw new Error("Transaction is not pending");

            // 2. Update User Balance
            await tx.user.update({
                where: { id: transaction.receiverId },
                data: { balance: { increment: transaction.amount } }
            });

            // 3. Update Transaction Status
            await tx.transaction.update({
                where: { id: transactionId },
                data: { status: 'COMPLETED' }
            });
        });

        res.json({ message: 'Deposit approved successfully' });
    } catch (error) {
        console.error('Approve deposit error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Reject Deposit
router.post('/deposits/reject', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { transactionId } = req.body;

    try {
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'FAILED' }
        });
        res.json({ message: 'Deposit rejected' });
    } catch (error) {
        console.error('Reject deposit error:', error);
        res.status(500).json({ error: 'Failed to reject deposit' });
    }
});

module.exports = router;
