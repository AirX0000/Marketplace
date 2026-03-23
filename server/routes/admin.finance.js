const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get Admin Stats
router.get('/stats', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
    const totalLiquidity = await prisma.user.aggregate({
        _sum: { balance: true }
    });

    const escrowVolume = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'ESCROW_HOLD' }
    });

    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ['PAID', 'COMPLETED', 'SHIPPED'] } }
    });

    const platformCommission = await prisma.order.aggregate({
        _sum: { commission: true },
        where: { status: { in: ['PAID', 'COMPLETED', 'SHIPPED'] } }
    });

    res.json({
        totalLiquidity: totalLiquidity._sum.balance || 0,
        escrowVolume: escrowVolume._sum.amount || 0,
        totalRevenue: totalRevenue._sum.total || 0,
        platformCommission: platformCommission._sum.commission || 0
    });
}));

// Get Pending Deposits
router.get('/deposits/pending', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
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
}));

// Approve Deposit
router.post('/deposits/approve', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
    const { transactionId } = req.body;

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
}));

// Reject Deposit
router.post('/deposits/reject', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
    const { transactionId } = req.body;

    await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'FAILED' }
    });
    res.json({ message: 'Deposit rejected' });
}));

// Resolve Escrow Dispute
router.post('/escrow/:transactionId/resolve', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { action } = req.body; // 'RELEASE' or 'REFUND'

    if (!['RELEASE', 'REFUND'].includes(action)) {
        const error = new Error("Invalid action. Use RELEASE or REFUND.");
        error.status = 400; throw error;
    }

    await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) throw new Error("Transaction not found");
        if (transaction.status !== 'ESCROW_HOLD') throw new Error("Transaction is not in ESCROW_HOLD status");

        if (action === 'RELEASE') {
            if (transaction.receiverId) {
                await tx.user.update({
                    where: { id: transaction.receiverId },
                    data: { balance: { increment: transaction.amount } }
                });
            }
            await tx.transaction.update({
                where: { id: transactionId },
                data: { status: 'COMPLETED', description: transaction.description + ' (Resolved: Admin Released)' }
            });
        } else if (action === 'REFUND') {
            if (transaction.senderId) {
                await tx.user.update({
                    where: { id: transaction.senderId },
                    data: { balance: { increment: transaction.amount } }
                });
            }
            await tx.transaction.update({
                where: { id: transactionId },
                data: { status: 'CANCELLED_REFUND', description: transaction.description + ' (Resolved: Admin Refunded)' }
            });
        }
    });

    res.json({ message: `Escrow successfully ${action === 'RELEASE' ? 'released to seller' : 'refunded to buyer'}` });
}));

module.exports = router;
