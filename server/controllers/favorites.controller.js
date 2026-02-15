const favoritesService = require('../services/favorites.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getFavorites = asyncHandler(async (req, res) => {
    const favorites = await favoritesService.getFavorites(req.user.userId);
    res.json(favorites);
});

exports.addFavorite = asyncHandler(async (req, res) => {
    const { marketplaceId } = req.body;
    const favorite = await favoritesService.addFavorite(req.user.userId, marketplaceId);
    res.status(201).json(favorite);
});

exports.removeFavorite = asyncHandler(async (req, res) => {
    const { marketplaceId } = req.params;
    await favoritesService.removeFavorite(req.user.userId, marketplaceId);
    res.json({ success: true });
});
