const userService = require('../services/user.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.userId);
    res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.userId, req.body);
    res.json(user);
});

exports.getAddresses = asyncHandler(async (req, res) => {
    const addresses = await userService.getAddresses(req.user.userId);
    res.json(addresses);
});

exports.addAddress = asyncHandler(async (req, res) => {
    const address = await userService.addAddress(req.user.userId, req.body);
    res.status(201).json(address);
});

exports.deleteAddress = asyncHandler(async (req, res) => {
    await userService.deleteAddress(req.user.userId, req.params.id);
    res.json({ success: true });
});

exports.getSharedFavorites = asyncHandler(async (req, res) => {
    try {
        const result = await userService.getSharedFavorites(req.params.userId);
        res.json(result);
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
});

exports.toggleWishlistPrivacy = asyncHandler(async (req, res) => {
    const result = await userService.toggleWishlistPrivacy(req.user.userId);
    res.json(result);
});
