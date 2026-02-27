const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require('../config/env');

class AIService {
    constructor() {
        if (!env.geminiApiKey) {
            console.warn("⚠️ GEMINI_API_KEY is not set in environment.");
            this.genAI = null;
        } else {
            this.genAI = new GoogleGenerativeAI(env.geminiApiKey);
        }
    }

    async generateContent(prompt, systemInstruction = "") {
        if (!this.genAI) throw new Error("AI Service not initialized. Missing API Key.");

        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini API Error:", error.message);
            if (error.message.includes("429")) {
                throw new Error("Ассистент временно перегружен запросами. Пожалуйста, попробуйте через минуту.");
            }
            throw error;
        }
    }

    async supportChat(userMessage, chatHistory = []) {
        if (!this.genAI) throw new Error("AI Service not initialized. Missing API Key.");

        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: "You are a helpful and polite support assistant for 'autohouse Marketplace'. " +
                "You help users with their questions about products, delivery, payments, and account issues. " +
                "Be concise and professional. Use the user's language (Russian if they use Russian)."
        });

        const chat = model.startChat({
            history: chatHistory.map(msg => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    }

    async generateProductDescription(productDetails) {
        const prompt = `Generate a compelling and professional marketplace product description in Russian based on these details: ${JSON.stringify(productDetails)}. Focus on benefits and key features.`;
        const systemInstruction = "You are a professional copywriter specialized in e-commerce product descriptions.";

        return this.generateContent(prompt, systemInstruction);
    }
}

module.exports = new AIService();
