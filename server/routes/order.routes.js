const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.getUserOrders);
router.get('/partner', authenticateToken, orderController.getPartnerOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.patch('/:id/status', authenticateToken, orderController.updateOrderStatus);
router.post('/:id/confirm', authenticateToken, orderController.confirmOrderReceipt);       // Buyer confirms receipt
router.post('/:id/seller-confirm', authenticateToken, orderController.sellerConfirmOrder); // Seller confirms → releases escrow

module.exports = router;
