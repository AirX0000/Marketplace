const passwordResetService = require('../services/passwordReset.service');

exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone is required' });
        const result = await passwordResetService.sendOTP(phone);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const result = await passwordResetService.verifyOTP(phone, code);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { phone, code, newPassword } = req.body;
        const result = await passwordResetService.resetPassword(phone, code, newPassword);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
