const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, offerController.createOffer);
router.get('/my', authenticateToken, offerController.getUserOffers);
router.put('/:id', authenticateToken, offerController.updateOfferStatus);

// Partner specific offer routes, arguably could be in partner.routes.js but fits logic here
// Frontned uses /api/partner/offers usually. 
// We will export a separate router or mount appropriately.
// Let's keep it simple: /api/offers/partner/incoming maybe? 
// Or just export two routers?
// Ideally we stick to resource based.
// /api/offers (POST create)
// /api/offers/my (GET user's sent offers)
// /api/offers/incoming (GET partner's received offers)

router.get('/incoming', authenticateToken, offerController.getPartnerOffers);

module.exports = router;
