const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');
const offerController = require('../controllers/offer.controller');
const { authenticateToken } = require('../middleware/auth');
const { kycCheck } = require('../middleware/kycCheck');

// Public Partner Profile
router.get('/partners/:id', partnerController.getPartner);

// Protected Partner Management Routes
// Protected endpoints (Management)
router.get('/partner/listings', authenticateToken, partnerController.getListings);
router.post('/partner/listings', authenticateToken, kycCheck, partnerController.createListing);
router.put('/partner/listings/:id', authenticateToken, kycCheck, partnerController.updateListing);
router.delete('/partner/listings/:id', authenticateToken, partnerController.deleteListing);

router.get('/partner/orders', authenticateToken, partnerController.getOrders);
router.get('/partner/customers', authenticateToken, partnerController.getCustomers);
router.put('/partner/orders/:itemId/status', authenticateToken, kycCheck, partnerController.updateOrderItemStatus);
router.get('/partner/stats', authenticateToken, partnerController.getStats);
router.get('/partner/finance', authenticateToken, partnerController.getFinance);
router.get('/partner/offers', authenticateToken, offerController.getPartnerOffers);

module.exports = router;
