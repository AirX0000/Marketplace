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
            }, { timeout: 5000 });
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
        if (!token) {
            console.error('[SMS SERVICE] Token acquisition failed');
            return { success: false, error: 'Auth failed' };
        }

        try {
            console.log(`[ESKIZ] Attempting to send SMS to ${cleanPhone}`);
            console.log(`[ESKIZ] Message: "${message}"`);
            
            const response = await axios.post('https://notify.eskiz.uz/api/message/sms/send', {
                mobile_phone: cleanPhone,
                message: message,
                from: '4546', // Default Eskiz nickname
                callback_url: ''
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            });
            
            console.log('[ESKIZ] Response Status:', response.status);
            console.log('[ESKIZ] Response Body:', JSON.stringify(response.data));
            
            if (response.data && (response.data.status === 'success' || response.data.status === 'waiting')) {
                return { success: true, data: response.data };
            } else {
                console.warn('[ESKIZ] Unexpected status in response:', response.data?.status);
                return { success: false, error: 'Unexpected response status', details: response.data };
            }
        } catch (error) {
            const errorData = error.response?.data;
            console.error('[ESKIZ] Send Error:', error.message);
            if (errorData) {
                console.error('[ESKIZ] Error Details:', JSON.stringify(errorData));
            }
            return { success: false, error: error.message, details: errorData };
        }
    }

    async sendOTP(phone, code) {
        // Use the EXACT template approved by Eskiz.uz
        const message = `Код верификации для входа к мобильному приложению autohouse.uz: ${code}`;
        return this.sendSms(phone, message);
    }
}

module.exports = new SmsService();
