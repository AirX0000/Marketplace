const prisma = require('../config/database');
const { ValidationError, NotFoundError } = require('../utils/errors');
const crypto = require('crypto');

class WalletService {
    // Get general wallet info (balance + linked cards)
    async getWallet(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
                        balance: true // Mock balance
                    }
                }
            }
        });

        if (!user) throw new NotFoundError('User not found');
        return user;
    }

    // Get user transaction history
    async getTransactions(userId, limit = 50) {
        return prisma.transaction.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    // Add a linked card (Mocking the tokenization process)
    async addCard(userId, cardData) {
        const { cardNumber, expiry, cardHolder, cardType, isDefault } = cardData;

        // Clean card number
        const cleanNumber = cardNumber.replace(/\D/g, '');
        if (cleanNumber.length < 16) throw new ValidationError('Invalid card number');

        // Generate fake token and mock balance for demo purposes
        const fakeToken = crypto.randomBytes(16).toString('hex');
        const mockBalance = Math.floor(Math.random() * 5000000) + 100000;

        // If this is the first card or explicitly marked as default, handle defaults
        if (isDefault) {
            await prisma.linkedCard.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        const newCard = await prisma.linkedCard.create({
            data: {
                userId,
                cardNumber: cleanNumber, // Storing full number for demo, usually it should be masked PAN!
                expiry,
                cardHolder: cardHolder ? cardHolder.toUpperCase() : null,
                cardType: cardType || 'CARD',
                token: fakeToken,
                balance: mockBalance,
                isDefault: isDefault || false
            }
        });

        return newCard;
    }

    // Remove a linked card
    async removeCard(userId, cardId) {
        const card = await prisma.linkedCard.findFirst({
            where: { id: cardId, userId }
        });

        if (!card) throw new NotFoundError('Card not found');

        await prisma.linkedCard.delete({
            where: { id: cardId }
        });

        return { message: 'Card removed successfully' };
    }

    // Secure P2P Internal Transfer
    async transferP2P(senderUserId, receiverIdentifier, amount) {
        if (amount <= 0) throw new ValidationError('Amount must be positive');

        return await prisma.$transaction(async (tx) => {
            // Fetch sender
            const sender = await tx.user.findUnique({
                where: { id: senderUserId }
            });

            if (!sender) throw new NotFoundError('Sender not found');
            if (sender.balance < amount) throw new ValidationError('Insufficient wallet funds');

            // Receiver identifier could be phone or accountId
            const cleanIdentifier = receiverIdentifier.replace(/\D/g, '');
            const receiver = await tx.user.findFirst({
                where: {
                    OR: [
                        { phone: cleanIdentifier },
                        { accountId: receiverIdentifier }
                    ]
                }
            });

            if (!receiver) throw new NotFoundError('Receiver not found');
            if (sender.id === receiver.id) throw new ValidationError('Cannot transfer to yourself');

            // 1. Deduct from Sender
            await tx.user.update({
                where: { id: sender.id },
                data: { balance: { decrement: amount } }
            });

            // 2. Add to Receiver
            await tx.user.update({
                where: { id: receiver.id },
                data: { balance: { increment: amount } }
            });

            // 3. Create Transaction Record
            const transactionRecord = await tx.transaction.create({
                data: {
                    amount,
                    type: 'TRANSFER',
                    status: 'COMPLETED',
                    description: `P2P Transfer to ${receiver.name || receiver.phone}`,
                    metadata: JSON.stringify({ transferMode: 'P2P_WALLET' }),
                    senderId: sender.id,
                    receiverId: receiver.id
                }
            });

            return transactionRecord;
        });
    }

    // Safe Deal / Escrow Init (Reserve funds)
    async holdFundsInEscrow(userId, orderId, amount) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.balance < amount) throw new ValidationError('Insufficient wallet funds for escrow');

            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: amount } }
            });

            await tx.order.update({
                where: { id: orderId },
                data: { escrowAmount: { increment: amount } }
            });

            return tx.transaction.create({
                data: {
                    amount,
                    type: 'ESCROW_HOLD',
                    status: 'COMPLETED',
                    senderId: userId,
                    metadata: JSON.stringify({ orderId })
                }
            });
        });
    }
}

module.exports = new WalletService();
