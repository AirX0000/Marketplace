const aiService = require('../services/ai.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.chat = asyncHandler(async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        const response = await aiService.supportChat(message, history || []);
        res.json({ response });
    } catch (error) {
        console.error("AI Chat Error:", error.message);

        // Provide helpful fallback response
        const fallbackResponse = "Я временно недоступен из-за технических ограничений API. " +
            "Но я могу помочь вам с:\n\n" +
            "• Информацией о доставке и оплате\n" +
            "• Поиском товаров в каталоге\n" +
            "• Вопросами о регистрации\n\n" +
            "Пожалуйста, свяжитесь с поддержкой: support@autohouse.uz";

        res.json({ response: fallbackResponse });
    }
});

exports.generateDescription = asyncHandler(async (req, res) => {
    const { productDetails } = req.body;
    if (!productDetails) return res.status(400).json({ error: "Product details are required" });

    try {
        const description = await aiService.generateProductDescription(productDetails);
        res.json({ description });
    } catch (error) {
        console.error("AI Description Generation Error:", error.message);

        // Provide a basic template as fallback
        const { name, category } = productDetails;
        const fallbackDescription = `${name}\n\nКатегория: ${category}\n\nОписание временно недоступно. Пожалуйста, добавьте описание вручную или попробуйте позже.`;

        res.json({ description: fallbackDescription });
    }
});

exports.analyzeListing = asyncHandler(async (req, res) => {
    const { listingData } = req.body;
    if (!listingData) return res.status(400).json({ error: "Listing data is required" });

    try {
        const analysis = await aiService.analyzeListingQuality(listingData);
        res.json(analysis);
    } catch (error) {
        console.error("AI Listing Analysis Error:", error.message);
        res.json({ 
            score: 70, 
            tips: ["Добавьте больше характеристик", "Убедитесь, что описание содержит ключевые слова"] 
        });
    }
});
