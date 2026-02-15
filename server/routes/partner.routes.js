const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');
const offerController = require('../controllers/offer.controller');
const { authenticateToken } = require('../middleware/auth');

// Public Partner Profile
router.get('/partners/:id', partnerController.getPartner);

// Protected Partner Management Routes
// Note: Mounted at /api so we use full subpaths here or explicit structure
// Actually, standard practice is to mount at /api/partner and have subpaths.
// But we have mixed /partners -> public and /partner -> private namespaces.
// For simplicity in refactoring without breaking frontend, we will define paths relative to /api if mounted there.
// OR we mount this router at /api

// Protected endpoints (Management)
router.get('/partner/listings', authenticateToken, partnerController.getListings);
router.post('/partner/listings', authenticateToken, partnerController.createListing);
router.put('/partner/listings/:id', authenticateToken, partnerController.updateListing);
router.delete('/partner/listings/:id', authenticateToken, partnerController.deleteListing);

router.get('/partner/orders', authenticateToken, partnerController.getOrders);
router.get('/partner/customers', authenticateToken, partnerController.getCustomers);
router.put('/partner/orders/:itemId/status', authenticateToken, partnerController.updateOrderItemStatus);
router.get('/partner/stats', authenticateToken, partnerController.getStats);
router.get('/partner/finance', authenticateToken, partnerController.getFinance);
router.get('/partner/offers', authenticateToken, offerController.getPartnerOffers);

module.exports = router;
