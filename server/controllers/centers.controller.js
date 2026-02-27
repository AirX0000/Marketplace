const centersService = require('../services/centers.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getCenters = asyncHandler(async (req, res) => {
    // Check if user is admin to decide if we show inactive
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const centers = await centersService.getCenters(isAdmin);
    res.json(centers);
});

exports.createCenter = asyncHandler(async (req, res) => {
    const center = await centersService.createCenter(req.body);
    res.status(201).json(center);
});

exports.updateCenter = asyncHandler(async (req, res) => {
    const center = await centersService.updateCenter(req.params.id, req.body);
    res.json(center);
});

exports.deleteCenter = asyncHandler(async (req, res) => {
    await centersService.deleteCenter(req.params.id);
    res.json({ success: true });
});
