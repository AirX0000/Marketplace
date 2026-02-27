const prisma = require('../config/database');
const smsService = require('./sms.service');

class PasswordResetService {
    async sendOTP(phone) {
        const formattedPhone = String(phone || '').replace(/\D/g, '');
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        try {
            await prisma.otp.delete({ where: { phone: formattedPhone } }).catch(() => { });
            await prisma.otp.create({
                data: {
                    phone: formattedPhone,
                    code: otp,
                    expiresAt: expiry
                }
            });

            // Send via SMS
            try {
                await smsService.sendSms(formattedPhone, `Код для сброса пароля: ${otp}. Действителен 10 минут.`);
                return { success: true, message: 'OTP sent successfully' };
            } catch (error) {
                console.error('SMS Service Error:', error);
                // Return OTP in dev for ease of testing if SMS fails
                if (process.env.NODE_ENV === 'development') {
                    return { success: true, message: 'SMS failed, OTP (DEV ONLY): ' + otp, otp };
                }
                return { success: false, error: 'Failed to send SMS' };
            }
        } catch (error) {
            console.error('Database Error:', error);
            throw new Error('Failed to generate OTP');
        }
    }

    async verifyOTP(phone, code) {
        const formattedPhone = String(phone || '').replace(/\D/g, '');
        try {
            const entry = await prisma.otp.findUnique({
                where: { phone: formattedPhone }
            });

            if (!entry || entry.code !== code || new Date() > entry.expiresAt) {
                return { success: false, error: 'Invalid or expired code' };
            }

            return { success: true };
        } catch (error) {
            throw new Error('Verification failed');
        }
    }

    async resetPassword(phone, code, newPassword) {
        const verify = await this.verifyOTP(phone, code);
        if (!verify.success) return verify;

        const formattedPhone = String(phone || '').replace(/\D/g, '');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        try {
            await prisma.user.update({
                where: { phone: formattedPhone },
                data: { password: hashedPassword }
            });

            // Cleanup OTP
            await prisma.otp.delete({ where: { phone: formattedPhone } }).catch(() => { });

            return { success: true, message: 'Password reset successful' };
        } catch (error) {
            console.error('Reset Password Error:', error);
            throw new Error('Failed to reset password');
        }
    }
}

module.exports = new PasswordResetService();
