const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendBalanceEmail } = require('../emailService');
const { asyncHandler } = require('../middleware/errorHandler');

// Get Wallet Info (Balance & History)
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
            balance: true,
            accountId: true,
            linkedCards: {
                select: {
                    id: true,
                    cardNumber: true,
                    expiry: true,
                    cardHolder: true,
                    cardType: true,
                    isActive: true,
                    isDefault: true,
                    balance: true
                }
            }
        }
    });

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    // Get recent transactions (Sent or Received)
    const transactions = await prisma.transaction.findMany({
        where: {
            OR: [
                { senderId: req.user.userId },
                { receiverId: req.user.userId }
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
        cards: user.linkedCards,
        transactions
    });
}));

// Add a linked card (Mocking the tokenization process)
router.post('/cards', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { cardNumber, expiry, cardHolder, cardType, isDefault } = req.body;

    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length < 16) {
        const error = new Error('Invalid card number');
        error.status = 400; throw error;
    }

    const crypto = require('crypto');
    const fakeToken = crypto.randomBytes(16).toString('hex');
    const mockBalance = Math.floor(Math.random() * 5000000) + 100000;

    if (isDefault) {
        await prisma.linkedCard.updateMany({
            where: { userId },
            data: { isDefault: false }
        });
    }

    const newCard = await prisma.linkedCard.create({
        data: {
            userId,
            cardNumber: cleanNumber,
            expiry,
            cardHolder: cardHolder ? cardHolder.toUpperCase() : null,
            cardType: cardType || 'CARD',
            token: fakeToken,
            balance: mockBalance,
            isDefault: isDefault || false
        }
    });

    res.status(201).json(newCard);
}));

// Remove a linked card
router.delete('/cards/:id', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;

    const card = await prisma.linkedCard.findFirst({
        where: { id, userId }
    });

    if (!card) {
        const error = new Error('Card not found');
        error.status = 404; throw error;
    }

    await prisma.linkedCard.delete({
        where: { id }
    });

    res.json({ message: 'Card removed successfully' });
}));

// Top Up Balance (Manual/System)
// Top Up Balance (Manual/System)
router.post('/deposit', authenticateToken, asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        const error = new Error('Invalid amount');
        error.status = 400;
        throw error;
    }

    // Create PENDING transaction
    // Do NOT update user balance yet
    const transaction = await prisma.transaction.create({
        data: {
            amount: parseFloat(amount),
            type: 'DEPOSIT',
            status: 'PENDING',
            receiverId: req.user.userId,
            description: 'Manual Balance Deposit (Pending Approval)'
        }
    });

    res.json({
        message: 'Deposit request submitted. Waiting for admin approval.',
        transactionId: transaction.id
    });
}));

// Alias: /topup maps to same logic as /deposit (used by frontend)
router.post('/topup', authenticateToken, asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        const error = new Error('Invalid amount');
        error.status = 400;
        throw error;
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const updated = await prisma.user.update({
        where: { id: req.user.userId },
        data: { balance: { increment: parseFloat(amount) } },
        select: { balance: true }
    });

    // Task 2: Notify balance topup
    sendBalanceEmail(user, parseFloat(amount), 'TOPUP', updated.balance);

    res.json({ balance: updated.balance });
}));

// P2P Transfer (Phone or ID)
router.post('/transfer', authenticateToken, asyncHandler(async (req, res) => {
    const { recipientIdentifier, amount, description } = req.body; // Identifier can be Phone or Email or AccountID

    if (!amount || amount <= 0) {
        const error = new Error('Invalid amount');
        error.status = 400;
        throw error;
    }

    await prisma.$transaction(async (tx) => {
        // 1. Check Sender Balance
        const sender = await tx.user.findUnique({ where: { id: req.user.userId } });
        if (!sender || sender.balance < amount) {
            const error = new Error('Insufficient funds');
            error.status = 400;
            throw error;
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
            const error = new Error('Recipient not found');
            error.status = 400;
            throw error;
        }

        if (recipient.id === sender.id) {
            const error = new Error('Cannot transfer to yourself');
            error.status = 400;
            throw error;
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

    // Task 2: Notify both parties
    const sender = await prisma.user.findUnique({ where: { id: req.user.id } });
    const recipient = await prisma.user.findFirst({
        where: {
            OR: [
                { phone: recipientIdentifier },
                { email: recipientIdentifier },
                { accountId: recipientIdentifier }
            ]
        }
    });
    if (sender) sendBalanceEmail(sender, parseFloat(amount), 'SPEND', sender.balance);
    if (recipient) sendBalanceEmail(recipient, parseFloat(amount), 'TOPUP', recipient.balance);

    res.json({ message: 'Transfer successful' });
}));

// Pay for Order from Wallet Balance
router.post('/pay', authenticateToken, asyncHandler(async (req, res) => {
    const { amount, orderId, description } = req.body;

    if (!amount || amount <= 0) {
        const error = new Error('Invalid amount');
        error.status = 400;
        throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: req.user.userId } });

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        if (user.balance < amount) {
            const error = new Error(`Insufficient funds. Balance: ${user.balance}, Required: ${amount}`);
            error.status = 400;
            throw error;
        }

        // Deduct balance
        const updated = await tx.user.update({
            where: { id: req.user.userId },
            data: { balance: { decrement: parseFloat(amount) } },
            select: { balance: true }
        });

        // Record payment transaction
        const transaction = await tx.transaction.create({
            data: {
                amount: parseFloat(amount),
                type: 'PAYMENT',
                status: 'COMPLETED',
                senderId: req.user.userId,
                description: description || (orderId ? `Order Payment #${orderId}` : 'Wallet Payment'),
                ...(orderId ? { orderId } : {})
            }
        });

        return { newBalance: updated.balance, transactionId: transaction.id };
    });

    sendBalanceEmail(
        await prisma.user.findUnique({ where: { id: req.user.userId } }),
        parseFloat(amount),
        'SPEND',
        result.newBalance
    );

    res.json({
        message: 'Payment successful',
        newBalance: result.newBalance,
        transactionId: result.transactionId
    });
}));

// Helper
async function getUserBalance(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user.balance;
}

// --- Phase 6: Goals and Subscriptions ---

router.post('/goals', authenticateToken, asyncHandler(async (req, res) => {
    const { title, targetAmount } = req.body;
    const goal = await prisma.fundingGoal.create({
        data: {
            title,
            targetAmount: parseFloat(targetAmount),
            creatorId: req.user.userId
        }
    });
    res.json(goal);
}));

router.get('/goals', authenticateToken, asyncHandler(async (req, res) => {
    const goals = await prisma.fundingGoal.findMany({
        where: { creatorId: req.user.userId }
    });
    res.json(goals);
}));

router.post('/goals/:id/contribute', authenticateToken, asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const goalId = req.params.id;
    
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: req.user.userId } });
        if (user.balance < amount) {
            const err = new Error('Insufficient funds'); err.status = 400; throw err;
        }
        
        await tx.user.update({
            where: { id: req.user.userId },
            data: { balance: { decrement: parseFloat(amount) } }
        });
        
        const goal = await tx.fundingGoal.update({
            where: { id: goalId },
            data: { currentAmount: { increment: parseFloat(amount) } }
        });
        
        await tx.transaction.create({
            data: { 
                amount: parseFloat(amount), 
                type: 'PAYMENT', 
                status: 'COMPLETED', 
                senderId: req.user.userId, 
                description: `Contribution to goal: ${goal.title}` 
            }
        });
        
        return goal;
    });
    
    res.json(result);
}));

router.get('/subscriptions', authenticateToken, asyncHandler(async (req, res) => {
    const subs = await prisma.subscription.findMany({
        where: { userId: req.user.userId }
    });
    res.json(subs);
}));

router.post('/subscriptions/toggle', authenticateToken, asyncHandler(async (req, res) => {
    const { id, active } = req.body;
    const sub = await prisma.subscription.update({
        where: { id, userId: req.user.userId },
        data: { active }
    });
    res.json(sub);
}));

module.exports = router;
