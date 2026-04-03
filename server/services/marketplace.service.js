console.log('🔹 [MarketplaceService] Requiring database...');
const prisma = require('../config/database');
console.log('🔹 [MarketplaceService] Database required.');


class MarketplaceService {
    async getAllListings(filters) {
        const {
            category, minPrice, maxPrice, region, sort, search, isFeatured, ids, tag,
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

        if (category && category !== 'All' && category !== 'Все') {
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
                { description: { contains: search, mode: 'insensitive' } },
                { vin: { contains: search, mode: 'insensitive' } },
                { partNumber: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (region && region !== 'All' && region !== 'Все') {
            const rLower = region.toLowerCase();
            if (rLower.includes('tashkent region') || rLower.includes('ташкентская') || rLower.includes('toshkent viloyati')) {
                where.region = { in: ['Tashkent Region', 'Ташкентская область', 'Tashkent viloyati'] };
            } else if (rLower.includes('tashkent') || rLower.includes('ташкент') || rLower.includes('toshkent')) {
                // Must be exact Tashkent city, but some people write 'г.Ташкент'
                where.region = { in: ['Tashkent', 'Ташкент', 'г.Ташкент', 'Toshkent', 'г. Ташкент'] };
            } else if (rLower.includes('samarkand') || rLower.includes('самарканд') || rLower.includes('samarqand')) {
                where.region = { in: ['Samarkand', 'Самарканд', 'Самаркандская область', 'Samarqand'] };
            } else if (rLower.includes('bukhara') || rLower.includes('бухара') || rLower.includes('buxoro')) {
                where.region = { in: ['Bukhara', 'Бухара', 'Бухарская область', 'Buxoro'] };
            } else if (rLower.includes('andijan') || rLower.includes('андижан') || rLower.includes('andijon')) {
                where.region = { in: ['Andijan', 'Андижан', 'Андижанская область', 'Andijon'] };
            } else if (rLower.includes('fergana') || rLower.includes('фергана') || rLower.includes('farg')) {
                where.region = { in: ['Fergana', 'Фергана', 'Ферганская область', "Farg'ona", "Fargona"] };
            } else {
                where.region = region;
            }
        }

        if (isFeatured === 'true' || isFeatured === true) {
            where.isFeatured = true;
        }

        if (tag) {
            if (tag === 'popular') {
                where.isFeatured = true;
            } else if (tag === 'electric') {
                where.category = { in: ['Cars', 'Transport', 'Автомобили', 'Транспорт'] };
                where.attributes = { path: ['specs', 'fuel'], equals: 'Электро' };
            } else if (tag === 'скидка' || tag === 'super_price') {
                where.OR = [
                    { discount: { gt: 0 } },
                    { attributes: { path: ['tag'], equals: 'скидка' } },
                    { status: 'SUPER_PRICE' }
                ];
            } else if (tag === 'premium') {
                where.attributes = { path: ['tag'], equals: 'premium' };
            } else if (tag === 'подарок' || tag === 'gift') {
                where.OR = [
                    { attributes: { path: ['tag'], equals: 'подарок' } },
                    { status: 'GIFT' }
                ];
            } else if (tag === 'скоро' || tag === 'soon') {
                where.OR = [
                    { attributes: { path: ['tag'], equals: 'скоро' } },
                    { status: 'SOON' }
                ];
            }
        }

        if (ids) {
            where.id = { in: ids.split(',') };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        // --- JSON Filtering (Cars & Real Estate) ---
        const catLower = (category || "").toLowerCase();
        const isAutoGroup = ["cars", "transport", "автомобили", "транспорт", "avtomobil", "avto", "с пробегом", "автосалон", "бозор", "moto"].some(s => catLower.includes(s));
        const isRealEstateGroup = ["real estate", "apartments", "houses", "недвижимость", "uy", "joy", "новостройки", "вторичные", "вторичное жильё", "аренда", "участки"].some(s => catLower.includes(s));

        if (isAutoGroup) {
            if (minYear || maxYear || minMileage || maxMileage || brand || (transmission && transmission !== 'Все') || (bodyType && bodyType !== 'Все')) {
                const carFilters = [];
                
                if (minYear) carFilters.push({ path: ['year'], gte: parseInt(minYear) });
                if (maxYear) carFilters.push({ path: ['year'], lte: parseInt(maxYear) });
                if (minMileage) carFilters.push({ path: ['mileage'], gte: parseInt(minMileage) });
                if (maxMileage) carFilters.push({ path: ['mileage'], lte: parseInt(maxMileage) });
                
                if (brand) carFilters.push({ path: ['brand'], equals: brand }); // We can use equals or specific mode if supported
                if (transmission && transmission !== 'Все') carFilters.push({ path: ['transmission'], equals: transmission });
                if (bodyType && bodyType !== 'Все') carFilters.push({ path: ['bodyType'], equals: bodyType });

                if (carFilters.length > 0) {
                    if (!where.AND) where.AND = [];
                    carFilters.forEach(f => where.AND.push({ specs: f }));
                }
            }
        }

        if (isRealEstateGroup) {
            const reFilters = [];
            if (minArea) reFilters.push({ path: ['area'], gte: parseInt(minArea) });
            if (maxArea) reFilters.push({ path: ['area'], lte: parseInt(maxArea) });
            
            if (rooms && rooms !== 'Все' && rooms !== '') {
                if (rooms === '4+') {
                    reFilters.push({ path: ['rooms'], gte: 4 });
                } else {
                    const roomVal = parseInt(rooms);
                    if (!isNaN(roomVal)) {
                        reFilters.push({ path: ['rooms'], equals: roomVal });
                    }
                }
            }
            if (floor && floor !== 'Все' && floor !== '') {
                const floorVal = parseInt(floor);
                if (!isNaN(floorVal)) {
                    reFilters.push({ path: ['floor'], equals: floorVal });
                }
            }

            if (reFilters.length > 0) {
                if (!where.AND) where.AND = [];
                reFilters.forEach(f => where.AND.push({ specs: f }));
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

    async getListingById(idOrSlug) {
        const listing = await prisma.marketplace.findFirst({
            where: {
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug }
                ]
            },
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
            where: { id: listing.id },
            data: { views: { increment: 1 } }
        }).catch(err => console.error("Failed to increment views", err));

        // Get related products (same category, different ID)
        const related = await prisma.marketplace.findMany({
            where: {
                category: listing.category,
                id: { not: listing.id },
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
        
        // Fetch counts for each category
        const categoriesWithCounts = await Promise.all(categories.map(async (c) => {
            const count = await prisma.marketplace.count({
                where: { category: c.name, status: 'APPROVED' }
            });
            return {
                ...c,
                count,
                sub: JSON.parse(c.subcategories || "[]")
            };
        }));

        return categoriesWithCounts;
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

    async getPriceHistory(marketplaceId) {
        return prisma.priceHistory.findMany({
            where: { marketplaceId },
            orderBy: { createdAt: 'asc' }
        });
    }
}


module.exports = new MarketplaceService();
