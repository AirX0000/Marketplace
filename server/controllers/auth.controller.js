const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
});

exports.login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
});
