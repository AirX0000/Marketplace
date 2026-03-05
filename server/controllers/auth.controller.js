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

exports.sendOTP = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        await prisma.oTP.upsert({
            where: { phone },
            update: { code, expiresAt },
            create: { phone, code, expiresAt }
        });

        const smsService = require('../services/sms.service');
        await smsService.sendSms(phone, `Код подтверждения Autohouse: ${code}`);
        res.json({ message: 'OTP sent' });
    } catch (e) {
        console.error('sendOTP Error:', e);
        res.status(500).json({ error: 'Failed to generate OTP' });
    }
});

exports.verifyOTP = asyncHandler(async (req, res) => {
    const { phone, code } = req.body;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const otp = await prisma.oTP.findUnique({ where: { phone } });
    if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark user as phone verified if they exist
    await prisma.user.updateMany({
        where: { phone },
        data: { isPhoneVerified: true }
    });

    await prisma.otp.delete({ where: { phone } });
    res.json({ message: 'Phone verified' });
});
