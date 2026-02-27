const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const smsService = require('./sms.service');

class PasswordResetService {
    async sendOTP(phone) {
        // Enforce + prefix
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        });

        if (!user) {
            throw new Error('Пользователь с таким номером не найден');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to OTP model
        await prisma.otp.upsert({
            where: { phone: formattedPhone },
            update: {
                code: otp,
                expiresAt: otpExpiry
            },
            create: {
                phone: formattedPhone,
                code: otp,
                expiresAt: otpExpiry
            }
        });

        // Send via SMS
        try {
            await smsService.sendSms(formattedPhone, `Код для сброса пароля: ${otp}. Действителен 10 минут.`);
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            console.error('SMS Service Error:', error);
            if (process.env.NODE_ENV === 'development') {
                return { success: true, message: 'OTP sent (stub)', otp };
            }
            throw new Error('Ошибка при отправке SMS. Попробуйте позже.');
        }
    }

    async verifyOTP(phone, code) {
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

        const otpRecord = await prisma.otp.findFirst({
            where: {
                phone: formattedPhone,
                code: code,
                expiresAt: { gt: new Date() }
            }
        });

        if (!otpRecord) {
            throw new Error('Неверный или просроченный код');
        }

        return { success: true };
    }

    async resetPassword(phone, code, newPassword) {
        const formattedPhon = phone.startsWith('+') ? phone : `+${phone}`;

        const otpRecord = await prisma.otp.findFirst({
            where: {
                phone: formattedPhon,
                code: code,
                expiresAt: { gt: new Date() }
            }
        });

        if (!otpRecord) {
            throw new Error('Неверный или просроченный код. Пожалуйста, запросите код снова.');
        }

        const user = await prisma.user.findFirst({
            where: { phone: formattedPhon }
        });

        if (!user) {
            throw new Error('Пользователь не найден');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword
            }
        });

        // Delete used OTP
        await prisma.otp.delete({
            where: { phone: formattedPhon }
        });

        return { success: true, message: 'Пароль успешно изменён' };
    }
}

module.exports = new PasswordResetService();
