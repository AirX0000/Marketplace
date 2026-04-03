const { asyncHandler } = require('../middleware/errorHandler');
const marketplaceService = require('../services/marketplace.service');
const cache = require('../services/cache.service');
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

exports.getCategories = asyncHandler(async (req, res) => {
    // Force refresh if requested or if cache is empty
    if (req.query.refresh === 'true') {
        cache.del(cache.KEYS.CATEGORIES);
    }
    
    const cachedCategories = cache.get(cache.KEYS.CATEGORIES);
    if (cachedCategories && cachedCategories.length > 2) return res.json(cachedCategories);

    try {
        const categories = await marketplaceService.getCategories();
        if (categories && categories.length > 0) {
            cache.set(cache.KEYS.CATEGORIES, categories);
        }
        res.json(categories);
    } catch (e) {
        console.error('Error fetching categories:', e);
        // Fallback
        res.json([
            { id: '1', name: 'Транспорт', slug: 'transport', count: 0 },
            { id: '2', name: 'Недвижимость', slug: 'real-estate', count: 0 },
            { id: '3', name: 'Услуги', slug: 'services', count: 0 },
        ]);
    }
});

exports.getRegions = asyncHandler(async (req, res) => {
    const cachedRegions = cache.get(cache.KEYS.REGIONS);
    if (cachedRegions) return res.json(cachedRegions);

    try {
        const regions = await marketplaceService.getRegions();
        cache.set(cache.KEYS.REGIONS, regions);
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
    cache.del(cache.KEYS.CATEGORIES); // Invalidate cache
    res.status(201).json(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    await marketplaceService.deleteCategory(req.params.id);
    cache.del(cache.KEYS.CATEGORIES); // Invalidate cache
    res.json({ success: true });
});

exports.createRegion = asyncHandler(async (req, res) => {
    const region = await marketplaceService.createRegion(req.body);
    cache.del(cache.KEYS.REGIONS); // Invalidate cache
    res.status(201).json(region);
});

exports.deleteRegion = asyncHandler(async (req, res) => {
    await marketplaceService.deleteRegion(req.params.id);
    cache.del(cache.KEYS.REGIONS); // Invalidate cache
    res.json({ success: true });
});

// Admin: Set isVerified / isOfficial trust flags
exports.setTrustFlags = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isVerified, isOfficial } = req.body;
    const prisma = require('../config/database');
    const listing = await prisma.marketplace.update({
        where: { id },
        data: {
            ...(typeof isVerified === 'boolean' && { isVerified }),
            ...(typeof isOfficial === 'boolean' && { isOfficial }),
        }
    });
    res.json(listing);
});

exports.updateListingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const adminService = require('../services/admin.service');
    const listing = await adminService.updateMarketplaceStatus(id, status, adminComment);
    res.json(listing);
});

exports.getPriceHistory = asyncHandler(async (req, res) => {
    const history = await marketplaceService.getPriceHistory(req.params.id);
    res.json(history);
});

