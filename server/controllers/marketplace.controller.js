console.log('🔹 [MarketplaceController] Requiring service...');
const marketplaceService = require('../services/marketplace.service');
console.log('🔹 [MarketplaceController] Requiring asyncHandler...');
const { asyncHandler } = require('../middleware/errorHandler');
console.log('🔹 [MarketplaceController] Imports done.');

exports.getAllListings = asyncHandler(async (req, res) => {
    const result = await marketplaceService.getAllListings(req.query);
    res.json(result);
});

exports.getFeaturedListings = asyncHandler(async (req, res) => {
    // Re-use getAllListings with specific params for featured (e.g., limit 6, sort popular)
    // Or if there is a 'isFeatured' field, use that. For now, just top 6 newest.
    const result = await marketplaceService.getAllListings({ limit: 6, page: 1 });
    // Frontend expects array, or we fix frontend.
    // Let's return the array to be backward compatible if HomePage expects array.
    // But better to be consistent. I will return array here as a specific data endpoint.
    res.json(result.listings);
});

exports.getListingById = asyncHandler(async (req, res) => {
    const listing = await marketplaceService.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
});

exports.getAllListings = asyncHandler(async (req, res) => {
    const result = await marketplaceService.getAllListings(req.query);
    res.json(result);
});

exports.getCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await marketplaceService.getCategories();
        res.json(categories);
    } catch (e) {
        // Fallback if table doesn't exist yet or other error
        res.json([
            { id: '1', name: 'Real Estate', slug: 'real-estate' },
            { id: '2', name: 'Vehicles', slug: 'vehicles' },
            { id: '3', name: 'Electronics', slug: 'electronics' },
            { id: '4', name: 'Services', slug: 'services' },
        ]);
    }
});

exports.getRegions = asyncHandler(async (req, res) => {
    try {
        const regions = await marketplaceService.getRegions();
        res.json(regions);
    } catch (e) {
        // Fallback
        res.json([
            { id: '1', name: 'Tashkent' },
            { id: '2', name: 'Samarkand' },
            { id: '3', name: 'Bukhara' },
        ]);
    }
});

exports.getReviews = asyncHandler(async (req, res) => {
    const reviews = await marketplaceService.getReviews(req.params.id);
    res.json(reviews);
});

exports.addReview = asyncHandler(async (req, res) => {
    const review = await marketplaceService.addReview(req.user.userId, req.body);
    res.status(201).json(review);
});

// Admin CRUD
exports.createCategory = asyncHandler(async (req, res) => {
    const category = await marketplaceService.createCategory(req.body);
    res.status(201).json(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    await marketplaceService.deleteCategory(req.params.id);
    res.json({ success: true });
});

exports.createRegion = asyncHandler(async (req, res) => {
    const region = await marketplaceService.createRegion(req.body);
    res.status(201).json(region);
});

exports.deleteRegion = asyncHandler(async (req, res) => {
    await marketplaceService.deleteRegion(req.params.id);
    res.json({ success: true });
});

