const prisma = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createRequest = asyncHandler(async (req, res) => {
    const { orderItemId, reason, details } = req.body;
    const userId = req.user.userId;

    // Verify ownership and eligibility
    const orderItem = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: { order: true }
    });

    if (!orderItem) {
        return res.status(404).json({ error: "Item not found" });
    }

    if (orderItem.order.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if simple eligibility rules apply (e.g. status)
    if (orderItem.status !== 'DELIVERED' && orderItem.status !== 'COMPLETED') {
        return res.status(400).json({ error: "Item must be delivered to request a return" });
    }

    const returnRequest = await prisma.returnRequest.create({
        data: {
            userId,
            orderItemId,
            reason,
            details,
            status: 'PENDING',
            images: JSON.stringify(req.body.images || [])
        }
    });

    res.status(201).json(returnRequest);
});

exports.getUserRequests = asyncHandler(async (req, res) => {
    const requests = await prisma.returnRequest.findMany({
        where: { userId: req.user.userId },
        include: {
            orderItem: {
                include: {
                    marketplace: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
});

exports.updateRequestStatus = asyncHandler(async (req, res) => {
    const { status, adminComment, refundAmount } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const request = await prisma.returnRequest.findUnique({
        where: { id: req.params.id },
        include: { orderItem: { include: { marketplace: true } } }
    });

    if (!request) return res.status(404).json({ error: "Return request not found" });

    // Permission check
    if (userRole !== 'ADMIN') {
        const isPartner = userRole === 'PARTNER';
        const isOwner = request.orderItem.marketplace.ownerId === userId;

        if (!isPartner || !isOwner) {
            return res.status(403).json({ error: "Access denied. Only the seller or admin can update status." });
        }
    }

    const updatedRequest = await prisma.returnRequest.update({
        where: { id: req.params.id },
        data: {
            status,
            adminComment,
            refundAmount: refundAmount ? parseFloat(refundAmount) : undefined
        }
    });

    res.json(updatedRequest);
});
