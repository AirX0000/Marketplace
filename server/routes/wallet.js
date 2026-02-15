const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');

// Get Wallet Info (Balance & History)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                balance: true, // 10% platform fee deduction
            }
        });

        // Get recent transactions (Sent or Received)
        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { senderId: req.user.id },
                    { receiverId: req.user.id }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                sender: { select: { name: true, phone: true } },
                receiver: { select: { name: true, phone: true } }
            }
        });

        res.json({
            balance: user.balance,
            accountId: user.accountId,
            transactions
        });
    } catch (error) {
        console.error('Error fetching wallet info:', error);
        res.status(500).json({ error: 'Failed to fetch wallet info' });
    }
});

// Top Up Balance (Manual/System)
// Top Up Balance (Manual/System)
router.post('/deposit', authenticateToken, async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        // Create PENDING transaction
        // Do NOT update user balance yet
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type: 'DEPOSIT',
                status: 'PENDING',
                receiverId: req.user.id,
                description: 'Manual Balance Deposit (Pending Approval)'
            }
        });

        res.json({
            message: 'Deposit request submitted. Waiting for admin approval.',
            transactionId: transaction.id
        });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ error: 'Deposit failed' });
    }
});

// P2P Transfer (Phone or ID)
router.post('/transfer', authenticateToken, async (req, res) => {
    const { recipientIdentifier, amount, description } = req.body; // Identifier can be Phone or Email or AccountID

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Check Sender Balance
            const sender = await tx.user.findUnique({ where: { id: req.user.id } });
            if (sender.balance < amount) {
                throw new Error('Insufficient funds');
            }

            // 2. Find Recipient
            // Try searching by Phone, Email, or Account ID
            const recipient = await tx.user.findFirst({
                where: {
                    OR: [
                        { phone: recipientIdentifier },
                        { email: recipientIdentifier },
                        { accountId: recipientIdentifier }
                    ]
                }
            });

            if (!recipient) {
                throw new Error('Recipient not found');
            }

            if (recipient.id === sender.id) {
                throw new Error('Cannot transfer to yourself');
            }

            // 3. Perform Transfer
            // Decrement Sender
            await tx.user.update({
                where: { id: sender.id },
                data: { balance: { decrement: parseFloat(amount) } }
            });

            // Increment Recipient
            await tx.user.update({
                where: { id: recipient.id },
                data: { balance: { increment: parseFloat(amount) } }
            });

            // 4. Create Transaction Record
            await tx.transaction.create({
                data: {
                    amount: parseFloat(amount),
                    type: 'TRANSFER',
                    status: 'COMPLETED',
                    senderId: sender.id,
                    receiverId: recipient.id,
                    description: description || 'P2P Transfer'
                }
            });
        });

        res.json({ message: 'Transfer successful' });
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(400).json({ error: error.message || 'Transfer failed' });
    }
});

// Helper
async function getUserBalance(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user.balance;
}

module.exports = router;
