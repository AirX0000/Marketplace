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

        // --- JSON Filtering (Cars & Real Estate) ---
        // We use path-based filtering for JSON fields
        if (["Cars", "Transport", "Автомобили"].includes(category)) {
            if (minYear || maxYear || minMileage || maxMileage || (transmission && transmission !== 'Все') || (bodyType && bodyType !== 'Все')) {
                where.attributes = {
                    path: ['specs'],
                    string_contains: '' // Placeholder to invoke JSON path filtering logic if needed, 
                    // but Prisma's `path` filter is more specific.
                };

                // Refined JSON filtering logic for Prisma
                const specsFilter = {};
                if (minYear) specsFilter.year = { gte: parseInt(minYear) };
                if (maxYear) specsFilter.year = { lte: parseInt(maxYear) };
                if (minMileage) specsFilter.mileage = { gte: parseInt(minMileage) };
                if (maxMileage) specsFilter.mileage = { lte: parseInt(maxMileage) };
                if (transmission && transmission !== 'Все') specsFilter.transmission = { equals: transmission };
                if (bodyType && bodyType !== 'Все') specsFilter.bodyType = { equals: bodyType };

                where.attributes = { path: ['specs'], equals: specsFilter };
                // Note: Complex range and exact match mix in deep JSON is better done via separate fields 
                // but since we migrated to Json type, we can use prisma.marketplace.findMany with path logic.
            }
        }

        if (["Real Estate", "Apartments", "Houses", "Недвижимость"].includes(category)) {
            const specsFilter = {};
            if (minArea) specsFilter.area = { gte: parseInt(minArea) };
            if (maxArea) specsFilter.area = { lte: parseInt(maxArea) };
            if (rooms && rooms !== 'Все') specsFilter.rooms = { equals: parseInt(rooms) };
            if (floor && floor !== 'Все') specsFilter.floor = { equals: parseInt(floor) };

            if (Object.keys(specsFilter).length > 0) {
                where.attributes = { path: ['specs'], equals: specsFilter };
            }
        }

        const marketplaces = await prisma.marketplace.findMany({
            where,
            include: { owner: { select: { name: true, phone: true, storeName: true } } },
            orderBy: [
                { isFeatured: 'desc' },
                sort === 'price_asc' ? { price: 'asc' }
                    : sort === 'price_desc' ? { price: 'desc' }
                        : { createdAt: 'desc' }
            ],
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });

        const total = await prisma.marketplace.count({ where });
        return {
            listings: marketplaces,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
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
