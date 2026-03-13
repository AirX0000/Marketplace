require('dotenv').config({ path: './server/.env' });
const axios = require('axios');

async function testEskiz() {
    const email = process.env.ESKIZ_EMAIL;
    const password = process.env.ESKIZ_PASSWORD;
    
    if (!email || !password) {
        console.error('Missing ESKIZ_EMAIL or ESKIZ_PASSWORD in .env');
        return;
    }

    try {
        console.log('1. Attempting Login...');
        const loginRes = await axios.post('https://notify.eskiz.uz/api/auth/login', {
            email, password
        });
        const token = loginRes.data.data.token;
        console.log('✅ Login successful. Token acquired.');

        console.log('\n2. Attempting to send SMS to +998901234567...');
        
        // Exact template from sms.service.js
        const code = "1234";
        const message = `Код верификации для входа к мобильному приложению autohouse.uz: ${code}`;
        
        const smsRes = await axios.post('https://notify.eskiz.uz/api/message/sms/send', {
            mobile_phone: '998901234567',
            message: message,
            from: '4546',
            callback_url: ''
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ SMS Send Response:');
        console.log(smsRes.data);

    } catch (error) {
        console.error('❌ Eskiz Test Failed!');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Message:', error.message);
    }
}

testEskiz();
