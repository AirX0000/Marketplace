const walletService = require('../services/wallet.service');
const { asyncHandler } = require('../middleware/errorHandler');

class WalletController {
    getWallet = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const wallet = await walletService.getWallet(userId);
        res.json(wallet);
    });

    getTransactions = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 50;
        const transactions = await walletService.getTransactions(userId, limit);
        res.json(transactions);
    });

    addCard = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const newCard = await walletService.addCard(userId, req.body);
        res.status(201).json(newCard);
    });

    removeCard = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { id } = req.params;
        const result = await walletService.removeCard(userId, id);
        res.json(result);
    });

    transferP2P = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { receiverIdentifier, amount } = req.body;
        
        const transaction = await walletService.transferP2P(userId, receiverIdentifier, parseFloat(amount));
        res.status(200).json({
            message: 'Transfer successful',
            transaction
        });
    });
}

module.exports = new WalletController();
