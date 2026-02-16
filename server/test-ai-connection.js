const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './.env' });

async function testAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        return;
    }

    console.log("🚀 Testing Gemini API from server dir...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Say hello and tell me you are ready to work for Aura Marketplace in Russian.");
        const response = await result.response;
        console.log("✅ API Response:", response.text());
    } catch (error) {
        console.error("❌ API Error:", error.message);
    }
}

testAI();
