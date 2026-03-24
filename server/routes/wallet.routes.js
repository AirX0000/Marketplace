const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all wallet routes
router.use(authenticateToken);

// Wallet Info & History
router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);

// Linked Cards
router.post('/cards', walletController.addCard);
router.delete('/cards/:id', walletController.removeCard);

// P2P Transfer
router.post('/transfer', walletController.transferP2P);

module.exports = router;
