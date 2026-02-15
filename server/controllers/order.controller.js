const orderService = require('../services/order.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createOrder = asyncHandler(async (req, res) => {
    try {
        const order = await orderService.createOrder(req.user.userId, req.body);

        // Post-transaction actions (Email, etc) can go here or in service via event emitter
        // emailService.sendOrderConfirmation(req.user, order).catch(console.error);

        res.status(201).json(order);
    } catch (error) {
        if (error.message.includes("Insufficient stock") || error.message.includes("Product not found")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to create order" });
    }
});

exports.getUserOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getUserOrders(req.user.userId);
    res.json(orders);
});

exports.getOrderById = asyncHandler(async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.user.userId, req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (error) {
        if (error.message === "Unauthorized") return res.status(403).json({ error: "Unauthorized" });
        res.status(500).json({ error: "Failed to fetch order" });
    }
});

exports.confirmOrderReceipt = asyncHandler(async (req, res) => {
    try {
        const order = await orderService.confirmOrderReceipt(req.user.userId, req.params.id);
        res.json({ message: "Order confirmed and funds released", order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.user.userId, req.params.id, status);
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

exports.getPartnerOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getPartnerOrders(req.user.userId);
    res.json(orders);
});
