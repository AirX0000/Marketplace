const supportService = require('../services/support.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getTickets = asyncHandler(async (req, res) => {
    const tickets = await supportService.getTickets(req.user.userId, req.user.role);
    res.json(tickets);
});

exports.getTicketById = asyncHandler(async (req, res) => {
    try {
        const ticket = await supportService.getTicketById(req.user.userId, req.user.role, req.params.id);
        if (!ticket) return res.status(404).json({ error: "Not found" });
        res.json(ticket);
    } catch (e) {
        if (e.message === "Access denied") return res.status(403).json({ error: "Access denied" });
        throw e;
    }
});

exports.createTicket = asyncHandler(async (req, res) => {
    const ticket = await supportService.createTicket(req.user.userId, req.body);
    res.json(ticket);
});

exports.replyTicket = asyncHandler(async (req, res) => {
    try {
        const reply = await supportService.replyTicket(req.user.userId, req.user.role, req.params.id, req.body.message);
        res.json(reply);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exports.updateStatus = asyncHandler(async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Admin only" });
    const updated = await supportService.updateStatus(req.params.id, req.body.status);
    res.json(updated);
});
