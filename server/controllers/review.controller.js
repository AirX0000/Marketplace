const reviewService = require('../services/review.service');

exports.createReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const marketplaceId = req.params.id;
        const review = await reviewService.createReview(userId, marketplaceId, req.body);
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMarketplaceReviews = async (req, res) => {
    try {
        const marketplaceId = req.params.id;
        const reviews = await reviewService.getMarketplaceReviews(marketplaceId);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reviewId = req.params.reviewId;
        await reviewService.deleteReview(userId, reviewId);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
