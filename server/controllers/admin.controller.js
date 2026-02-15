const adminService = require('../services/admin.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await adminService.getAllUsers();
    res.json(users);
});

exports.updateUserRole = asyncHandler(async (req, res) => {
    const user = await adminService.updateUserRole(req.params.id, req.body.role);
    res.json(user);
});

exports.toggleBlockUser = asyncHandler(async (req, res) => {
    const user = await adminService.toggleBlockUser(req.params.id, req.body.isBlocked);
    res.json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.user.userId, req.params.id);
    res.json({ success: true });
});

exports.getMarketplaces = asyncHandler(async (req, res) => {
    const marketplaces = await adminService.getMarketplaces(req.query.status);
    res.json(marketplaces);
});

exports.deleteMarketplace = asyncHandler(async (req, res) => {
    await adminService.deleteMarketplace(req.params.id);
    res.json({ success: true });
});

exports.updateMarketplaceStatus = asyncHandler(async (req, res) => {
    const marketplace = await adminService.updateMarketplaceStatus(req.params.id, req.body.status);
    res.json(marketplace);
});

exports.getStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getStats();
    res.json(stats);
});

