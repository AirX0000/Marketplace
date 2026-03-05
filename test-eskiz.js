require('dotenv').config();
const axios = require('axios');

async function testEskiz() {
    try {
        console.log("Testing Eskiz Auth with:", process.env.ESKIZ_EMAIL);
        const response = await axios.post('https://notify.eskiz.uz/api/auth/login', {
            email: process.env.ESKIZ_EMAIL,
            password: process.env.ESKIZ_PASSWORD
        });
        console.log("Success! Token received:", response.data.data.token.substring(0, 15) + "...");
    } catch (error) {
        console.error("Failed to authenticate with Eskiz!");
        console.error(error.response?.data || error.message);
    }
}

testEskiz();
