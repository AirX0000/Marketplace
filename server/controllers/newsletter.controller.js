console.log('🔹 [NewsletterController] Requiring service...');
const newsletterService = require('../services/newsletter.service');
console.log('🔹 [NewsletterController] Requiring asyncHandler...');
const { asyncHandler } = require('../middleware/errorHandler');
console.log('🔹 [NewsletterController] Imports done.');

exports.sendBroadcast = asyncHandler(async (req, res) => {
    const { subject, message, targetRole } = req.body;
    const count = await newsletterService.sendBroadcast(subject, message, targetRole);
    res.json({ success: true, count });
});

exports.getStats = asyncHandler(async (req, res) => {
    const stats = await newsletterService.getStats();
    res.json(stats);
});

exports.getHistory = asyncHandler(async (req, res) => {
    const history = await newsletterService.getHistory();
    res.json(history);
});
