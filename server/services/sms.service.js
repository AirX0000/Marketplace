const axios = require('axios');

class SmsService {
    constructor() {
        this.email = process.env.ESKIZ_EMAIL;
        this.password = process.env.ESKIZ_PASSWORD;
        this.token = null;
    }

    async getToken() {
        if (this.token) return this.token;
        try {
            const response = await axios.post('https://notify.eskiz.uz/api/auth/login', {
                email: this.email,
                password: this.password
            });
            this.token = response.data.data.token;
            return this.token;
        } catch (error) {
            console.error('Eskiz Login Error:', error.response?.data || error.message);
            return null;
        }
    }

    async sendSms(phone, message) {
        // Clean phone number: +998901234567 -> 998901234567
        const cleanPhone = String(phone || '').replace(/\D/g, '');

        // Mock if environment variables are missing
        if (!this.email || !this.password) {
            console.log(`[MOCK SMS] To: ${cleanPhone}, Message: ${message}`);
            return { success: true, mock: true };
        }

        const token = await this.getToken();
        if (!token) return { success: false, error: 'Auth failed' };

        try {
            const response = await axios.post('https://notify.eskiz.uz/api/message/sms/send', {
                mobile_phone: cleanPhone,
                message: message,
                from: '4546', // Default Eskiz nickname
                callback_url: ''
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Eskiz Send Error:', error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    }

    async sendOTP(phone, code) {
        return this.sendSms(phone, `Ваш код подтверждения Autohouse: ${code}`);
    }
}

module.exports = new SmsService();
