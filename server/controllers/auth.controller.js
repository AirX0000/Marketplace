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

    const code = Math.floor(1000 + Math.random() * 9000).toString();
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
        const smsResult = await smsService.sendSms(phone, `Код подтверждения Autohouse: ${code}`);

        if (!smsResult.success) {
            console.error('SMS Send Failed:', smsResult.error);
            return res.status(400).json({
                error: 'Не удалось отправить СМС. Проверьте номер телефона или попробуйте позже.',
                details: smsResult.error
            });
        }

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

    await prisma.oTP.delete({ where: { phone } });
    res.json({ message: 'Phone verified' });
});

exports.loginByOTP = asyncHandler(async (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Phone and code are required' });

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const jwt = require('jsonwebtoken');
    const env = require('../config/env');

    // Validate OTP
    const otp = await prisma.oTP.findUnique({ where: { phone } });
    if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Find user with that phone
    const user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
        return res.status(404).json({ error: 'No account found with this phone number. Please register first.' });
    }

    // Delete used OTP
    await prisma.oTP.delete({ where: { phone } });

    // Mark phone as verified
    await prisma.user.update({ where: { id: user.id }, data: { isPhoneVerified: true } });

    // Issue JWT
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
});
