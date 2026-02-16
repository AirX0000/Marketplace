import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: './server/.env' });

async function testAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        return;
    }

    console.log("🚀 Testing Gemini API with key:", apiKey.substring(0, 10) + "...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello and tell me you are ready to work for Aura Marketplace in Russian.");
        const response = await result.response;
        console.log("✅ API Response:", response.text());
    } catch (error) {
        console.error("❌ API Error:", error.message);
    }
}

testAI();
