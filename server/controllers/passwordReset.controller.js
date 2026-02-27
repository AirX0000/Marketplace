const passwordResetService = require('../services/passwordReset.service');

exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: 'Номер телефона обязателен' });
        }
        const result = await passwordResetService.sendOTP(phone);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({ message: 'Номер телефона и код обязательны' });
        }
        const result = await passwordResetService.verifyOTP(phone, code);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { phone, code, newPassword } = req.body;
        if (!phone || !code || !newPassword) {
            return res.status(400).json({ message: 'Все поля обязательны' });
        }
        const result = await passwordResetService.resetPassword(phone, code, newPassword);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
