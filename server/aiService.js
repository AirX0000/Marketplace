/**
 * Simple Rule-Based AI Service for Real Estate Recommendations
 * Parses natural language queries to extract constraints:
 * - Budget (numbers with 'k', '$', 'sum')
 * - Rooms (numbers with 'room', 'komnat')
 * - Location (District names)
 * - Category (House, Apartment)
 */

function parseQuery(query) {
    const filters = {};
    const lowerQuery = query.toLowerCase();

    // 1. Detect Category
    // 1. Detect Category
    if (lowerQuery.includes('дом') || lowerQuery.includes('house') || lowerQuery.includes('уч')) {
        filters.category = ['Houses', 'Land'];
    } else if (lowerQuery.includes('квартир') || lowerQuery.includes('flat') || lowerQuery.includes('apartment')) {
        filters.category = ['Apartments'];
    } else if (lowerQuery.includes('авто') || lowerQuery.includes('car') || lowerQuery.includes('bmw') || lowerQuery.includes('mercedes')) {
        filters.category = ['Cars', 'Transport'];
    } else if (lowerQuery.includes('phone') || lowerQuery.includes('тел') || lowerQuery.includes('iphone') || lowerQuery.includes('samsung')) {
        filters.category = ['Electronics'];
    }

    // 2. Detect Rooms (e.g., "2 komnat", "3 rooms", "2-х")
    const roomsMatch = lowerQuery.match(/(\d+)\s*(?:комн|room|x|х)/);
    if (roomsMatch) {
        filters.rooms = parseInt(roomsMatch[1]);
    }

    // 3. Detect Budget (e.g., "50k", "50000", "do 60000")
    // Simple extraction of the largest number defining max price
    const numbers = lowerQuery.match(/\d+(?:[.,]\d+)?/g);
    if (numbers) {
        const potentialBudgets = numbers.map(n => parseFloat(n.replace(',', '.')));
        // Assuming budget is likely > 1000 (to avoid room counts) or explicitly large
        const budget = potentialBudgets.find(n => n > 1000) || (potentialBudgets.find(n => n > 10 && lowerQuery.includes('k')) * 1000);

        if (budget) {
            filters.maxPrice = budget;
        }
    }

    // Handle "k" suffix (e.g. 50k = 50000)
    const kMatch = lowerQuery.match(/(\d+)k/);
    if (kMatch) {
        filters.maxPrice = parseInt(kMatch[1]) * 1000;
    }

    // 4. Detect Location (Basic Keyword Search against known districts)
    const districts = ['chilanzar', 'mirabad', 'yunusabad', 'yakkasaray', 'sergeli', 'mirzo ulugbek'];
    for (const d of districts) {
        // Simple mapping for cyrillic/latin variations could go here
        if (lowerQuery.includes(d) || lowerQuery.includes('чиланзар') || lowerQuery.includes('мирабад')) {
            if (lowerQuery.includes('чиланзар')) filters.district = 'Chilanzar';
            if (lowerQuery.includes('мирабад')) filters.district = 'Mirabad';
            // ... simplify for demo
            filters.locationKeyword = d;
        }
    }

    return filters;
}

/**
 * Filter products based on parsed constraints
 */
/**
 * Filter products based on parsed constraints
 */
function recommendProducts(products, query) {
    const filters = parseQuery(query);

    const recommendations = products.filter(p => {
        let score = 0;

        // Category Match
        if (filters.category && !filters.category.includes(p.category)) return false;

        // Price limit
        if (filters.maxPrice && p.price > filters.maxPrice) return false;

        // Spec: Rooms
        if (filters.rooms) {
            let pRooms = 0;
            // Parse specs from JSON string or object
            const specs = typeof p.attributes === 'string'
                ? JSON.parse(p.attributes).specs
                : p.attributes?.specs; // Fallback

            if (specs && specs.rooms) pRooms = parseInt(specs.rooms);

            // Exact match or +1/-1 range? Let's say exact or +1
            if (pRooms === filters.rooms) score += 3;
            else if (pRooms >= filters.rooms) score += 1;
            else return false; // Too few rooms
        }

        // Location fuzzy match
        if (filters.locationKeyword) {
            const fullText = (p.name + " " + p.description + " " + (p.attributes?.district || "")).toLowerCase();
            if (fullText.includes(filters.locationKeyword)) score += 5;
        }

        return true;
    }).slice(0, 5); // Return top 5

    return { filters, recommendations };
}

module.exports = { recommendProducts };
