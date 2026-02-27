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
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const smsService = require('../services/sms.service');

    await prisma.otp.upsert({
        where: { phone },
        update: { code, expiresAt },
        create: { phone, code, expiresAt }
    });

    await smsService.sendOTP(phone, code);
    res.json({ message: 'OTP sent' });
});

exports.verifyOTP = asyncHandler(async (req, res) => {
    const { phone, code } = req.body;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const otp = await prisma.otp.findUnique({ where: { phone } });
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
