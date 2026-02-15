const express = require('express');
const router = express.Router();
console.log('🔹 [MarketplaceRoutes] Requiring controller...');
const marketplaceController = require('../controllers/marketplace.controller');
console.log('🔹 [MarketplaceRoutes] Requiring auth...');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
console.log('🔹 [MarketplaceRoutes] Imports done.');

router.get('/listings/featured', marketplaceController.getFeaturedListings);
router.get('/listings', marketplaceController.getAllListings);
router.get('/listings/:id', marketplaceController.getListingById);

// Categories
router.get('/categories', marketplaceController.getCategories);
router.post('/categories', authenticateToken, authorizeRole(['ADMIN']), marketplaceController.createCategory);
router.delete('/categories/:id', authenticateToken, authorizeRole(['ADMIN']), marketplaceController.deleteCategory);

// Regions
router.get('/regions', marketplaceController.getRegions);
router.post('/regions', authenticateToken, authorizeRole(['ADMIN']), marketplaceController.createRegion);
router.delete('/regions/:id', authenticateToken, authorizeRole(['ADMIN']), marketplaceController.deleteRegion);

// Reviews
router.get('/listings/:id/reviews', marketplaceController.getReviews);
router.post('/reviews', authenticateToken, marketplaceController.addReview);
router.get('/marketplaces/:id/reviews', marketplaceController.getReviews);

module.exports = router;

