const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/marketplace/:id', reviewController.getMarketplaceReviews);
router.post('/marketplace/:id', authenticateToken, reviewController.createReview);
router.delete('/:reviewId', authenticateToken, reviewController.deleteReview);

module.exports = router;
