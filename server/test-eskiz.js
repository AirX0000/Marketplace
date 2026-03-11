const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load .env manually as in the server
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            const val = values.join('=').trim().replace(/^["'](.+)["']$/, '$1');
            process.env[key.trim()] = val;
        }
    });
    console.log('✅ Loaded .env');
}

const email = process.env.ESKIZ_EMAIL;
const password = process.env.ESKIZ_PASSWORD;

async function testEskiz() {
    console.log(`Testing Eskiz with Email: ${email}`);
    if (!email || !password) {
        console.error('❌ Missing credentials in .env');
        return;
    }

    try {
        console.log('1. Attempting Login...');
        const loginRes = await axios.post('https://notify.eskiz.uz/api/auth/login', {
            email, password
        });
        const token = loginRes.data.data.token;
        console.log('✅ Login Successful! Token received.');

        console.log('2. Attempting to send test SMS to +998935179146...');
        const smsRes = await axios.post('https://notify.eskiz.uz/api/message/sms/send', {
            mobile_phone: '998935179146',
            message: 'Код верификации для входа к мобильному приложению autohouse.uz: 1234',
            from: '4546'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ SMS Send Request Successful:', smsRes.data);
    } catch (error) {
        console.error('❌ Eskiz Test Failed:');
        console.error(error.response?.data || error.message);
    }
}

testEskiz();
