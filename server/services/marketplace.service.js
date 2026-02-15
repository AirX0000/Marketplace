console.log('🔹 [MarketplaceService] Requiring database...');
const prisma = require('../config/database');
console.log('🔹 [MarketplaceService] Database required.');


class MarketplaceService {
    async getAllListings(filters) {
        const {
            category, minPrice, maxPrice, region, sort, search, isFeatured,
            // Car Filters
            minYear, maxYear,
            minMileage, maxMileage,
            transmission, bodyType,
            // Real Estate Filters
            minArea, maxArea,
            rooms, floor, renovation,
            // Common
            page = 1, limit = 20
        } = filters;

        const where = { status: 'APPROVED' };

        if (category && category !== 'All') {
            if (category.includes(',')) {
                const categories = category.split(',').map(c => c.trim());
                where.category = { in: categories };
            } else {
                where.category = category;
            }
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (region && region !== 'All' && region !== 'Все') {
            where.region = region;
        }

        if (isFeatured === 'true' || isFeatured === true) {
            where.isFeatured = true;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        // Fetch ALL matching basic criteria for memory filtering (since attributes are stored as String)
        // If the dataset was huge, we would use raw SQL or migrate to JSONB.
        // Fetch ALL matching basic criteria for memory filtering (since attributes are stored as String)
        // If the dataset was huge, we would use raw SQL or migrate to JSONB.
        let marketplaces = await prisma.marketplace.findMany({
            where,
            include: { owner: { select: { name: true, phone: true, storeName: true } } }, // Added phone
            orderBy: [
                { isFeatured: 'desc' }, // Featured first
                sort === 'price_asc' ? { price: 'asc' }
                    : sort === 'price_desc' ? { price: 'desc' }
                        : { createdAt: 'desc' }
            ]
        });

        // In-Memory Filtering for JSON Attributes
        marketplaces = marketplaces.filter(item => {
            if (!item.attributes) return true;
            let attrs;
            try {
                attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes;
                if (!attrs.specs) attrs.specs = attrs; // fallback
            } catch (e) {
                return true;
            }
            // Specs might be top level or under 'specs' key depending on seed quality.
            // Using a helper to find the value? For now assume `attrs.specs` or `attrs`.
            const specs = attrs.specs || attrs;

            // CARS
            if (["Cars", "Transport", "Автомобили", "Седан", "Кроссовер", "Внедорожник"].includes(item.category) ||
                (category && (category === 'Cars' || category === 'Transport' || category === 'Автомобили'))) {
                if (minYear && specs.year < parseInt(minYear)) return false;
                if (maxYear && specs.year > parseInt(maxYear)) return false;
                if (minMileage && specs.mileage < parseInt(minMileage)) return false;
                if (maxMileage && specs.mileage > parseInt(maxMileage)) return false;
                if (transmission && transmission !== 'Все' && specs.transmission !== transmission) return false;
                if (bodyType && bodyType !== 'Все' && specs.bodyType !== bodyType) return false;
            }

            // REAL ESTATE
            if (["Real Estate", "Apartments", "Houses", "Недвижимость", "Квартиры", "Дома"].includes(item.category) ||
                (category && (category === 'Real Estate' || category === 'Недвижимость'))) {
                if (minArea && specs.area < parseInt(minArea)) return false;
                if (maxArea && specs.area > parseInt(maxArea)) return false;
                if (rooms && rooms !== 'Все' && parseInt(specs.rooms) !== parseInt(rooms)) return false;
                if (floor && floor !== 'Все' && parseInt(specs.floor) !== parseInt(floor)) return false;
            }

            return true;
        });

        const total = marketplaces.length;
        const totalPages = Math.ceil(total / limit);
        const paginated = marketplaces.slice((page - 1) * limit, page * limit);

        return {
            listings: paginated,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: totalPages
            }
        };
    }

    async getListingById(id) {
        const listing = await prisma.marketplace.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        storeName: true,
                        storeLogo: true,
                        phone: true,
                        createdAt: true
                    }
                },
                reviews: {
                    include: { user: { select: { name: true, avatar: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!listing) return null;

        // Increment views (fire and forget)
        prisma.marketplace.update({
            where: { id },
            data: { views: { increment: 1 } }
        }).catch(err => console.error("Failed to increment views", err));

        // Get related products (same category, different ID)
        const related = await prisma.marketplace.findMany({
            where: {
                category: listing.category,
                id: { not: id },
                status: 'APPROVED'
            },
            take: 4,
            orderBy: { rating: 'desc' } // or createdAt, views, etc.
        });

        return { ...listing, related };
    }

    async getReviews(marketplaceId) {
        return prisma.review.findMany({
            where: { marketplaceId },
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async addReview(userId, data) {
        const { marketplaceId, rating, comment, photos } = data;

        const review = await prisma.review.create({
            data: {
                userId,
                marketplaceId,
                rating,
                comment,
                photos: photos ? JSON.stringify(photos) : "[]",
                isVerified: true // Mock verifiy
            },
            include: { user: { select: { id: true, name: true, avatar: true } } }
        });

        // Update product average rating
        const allReviews = await prisma.review.findMany({ where: { marketplaceId } });
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.marketplace.update({
            where: { id: marketplaceId },
            data: { rating: avg }
        });

        return review;
    }

    async getCategories() {
        const categories = await prisma.category.findMany();
        return categories.map(c => ({
            ...c,
            sub: JSON.parse(c.subcategories || "[]")
        }));
    }


    async getRegions() {
        return prisma.region.findMany();
    }

    // Admin CRUD for Categories/Regions
    async createCategory(data) {
        return prisma.category.create({
            data: {
                name: data.name,
                subcategories: data.subcategories ? JSON.stringify(data.subcategories) : "[]"
            }
        });
    }

    async deleteCategory(id) {
        return prisma.category.delete({ where: { id } });
    }

    async createRegion(data) {
        return prisma.region.create({
            data: { name: data.name }
        });
    }

    async deleteRegion(id) {
        return prisma.region.delete({ where: { id } });
    }
}


module.exports = new MarketplaceService();
