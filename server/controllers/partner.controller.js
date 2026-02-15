const partnerService = require('../services/partner.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getPartner = asyncHandler(async (req, res) => {
    const partner = await partnerService.getPartner(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });
    res.json(partner);
});

exports.createListing = asyncHandler(async (req, res) => {
    const result = await partnerService.createListing(req.user.userId, req.body);
    res.status(201).json(result);
});

exports.updateListing = asyncHandler(async (req, res) => {
    try {
        const result = await partnerService.updateListing(req.user.userId, req.user.role, req.params.id, req.body);
        res.json(result);
    } catch (error) {
        if (error.message === "Unauthorized") return res.status(403).json({ error: error.message });
        if (error.message === "Listing not found") return res.status(404).json({ error: error.message });
        throw error;
    }
});

exports.deleteListing = asyncHandler(async (req, res) => {
    try {
        await partnerService.deleteListing(req.user.userId, req.params.id);
        res.json({ message: "Listing deleted" });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

exports.getListings = asyncHandler(async (req, res) => {
    const listings = await partnerService.getListings(req.user.userId);
    res.json(listings);
});

exports.getOrders = asyncHandler(async (req, res) => {
    const orders = await partnerService.getOrders(req.user.userId);
    res.json(orders);
});

exports.getCustomers = asyncHandler(async (req, res) => {
    const customers = await partnerService.getCustomers(req.user.userId);
    res.json(customers);
});

exports.updateOrderItemStatus = asyncHandler(async (req, res) => {
    try {
        const result = await partnerService.updateOrderItemStatus(req.user.userId, req.params.itemId, req.body.status);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

exports.getStats = asyncHandler(async (req, res) => {
    const stats = await partnerService.getStats(req.user.userId);
    res.json(stats);
});

exports.getFinance = asyncHandler(async (req, res) => {
    const finance = await partnerService.getFinance(req.user.userId);
    res.json(finance);
});
