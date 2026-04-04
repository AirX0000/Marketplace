console.log('🔹 [MarketplaceService] Requiring database...');
const prisma = require('../config/database');
console.log('🔹 [MarketplaceService] Database required.');


class MarketplaceService {
    async getAllListings(filters) {
        const {
            category, minPrice, maxPrice, region, sort, search, isFeatured, ids, tag, subcategory,
            // Car Filters
            minYear, maxYear,
            minMileage, maxMileage,
            transmission, bodyType, brand,
            // Real Estate Filters
            minArea, maxArea,
            rooms, floor, renovation,
            // Common
            page = 1, limit = 20
        } = filters;

        const where = { status: 'APPROVED' };
        const andConditions = [];

        // Handle Category/Subcategory with inclusive matching
        if (category && category !== 'All' && category !== 'Все') {
            let targetCategory = category;
            
            // Handle common aliases for cars
            if (targetCategory.toLowerCase() === 'машины' || targetCategory.toLowerCase() === 'cars') {
                targetCategory = 'Транспорт';
            }

            // Subcategory takes priority if it's not "Все"
            const effectiveCategory = subcategory && subcategory !== 'Все' ? subcategory : targetCategory;
            
            if (effectiveCategory.includes(',')) {
                // If the frontend sends a CSV of categories
                const categories = effectiveCategory.split(',').map(c => c.trim());
                andConditions.push({
                    OR: categories.map(cat => ({ category: { equals: cat, mode: 'insensitive' } }))
                });
            } else {
                // If it's a single category, check if it's a "Parent" category with subcategories
                try {
                    let dbCategory = await prisma.category.findFirst({
                        where: { name: { equals: effectiveCategory, mode: 'insensitive' } }
                    });

                    // Reverse lookup: If name not found, check if it exists within subcategories of any parent
                    if (!dbCategory) {
                        const allCats = await prisma.category.findMany();
                        dbCategory = allCats.find(c => {
                            try {
                                const subs = JSON.parse(c.subcategories || "[]");
                                return Array.isArray(subs) && subs.some(s => s.toLowerCase() === effectiveCategory.toLowerCase());
                            } catch (e) { return false; }
                        });
                    }

                    if (dbCategory && dbCategory.subcategories) {
                        try {
                            const subCats = JSON.parse(dbCategory.subcategories);
                            let searchList = Array.isArray(subCats) ? [dbCategory.name, ...subCats] : [dbCategory.name];
                            
                            // Add common variations/keywords for broad matching
                            const catLower = dbCategory.name.toLowerCase();
                            if (catLower.includes('транспорт') || catLower.includes('transport')) {
                                searchList = [...new Set([...searchList, 
                                    "Автосалон", "Бозор", "С пробегом", "Машины", "Cars", "Transport", 
                                    "Автосалон (Новые авто)", "Бозор (Авто с пробегом)", "АВТОСАЛОН", "БОЗОР",
                                    "Седан", "Внедорожник", "SUV", "Кроссовер", "Crossover", "Хэтчбек", "Hatchback", 
                                    "Универсал", "Купе", "Coupe", "Кабриолет", "Минивэн", "Пикап", "Trucks", "Moto"
                                ])];
                            } else if (catLower.includes('недвижимость') || catLower.includes('real estate')) {
                                searchList = [...new Set([...searchList, 
                                    "Квартиры", "Дома", "Новостройки", "Вторичное жильё", "Участки", 
                                    "Коммерческая недвижимость", "Novostroyka", "Houses", "Apartment", "Real Estate", 
                                    "НОВОСТРОЙКИ", "Вторичка", "Аренда", "Участок"
                                ])];
                            }

                            // Use OR with mode: 'insensitive' for each possible category name
                            andConditions.push({
                                OR: searchList.map(cat => ({ category: { equals: cat, mode: 'insensitive' } }))
                            });
                        } catch (e) {
                            andConditions.push({ category: { equals: effectiveCategory, mode: 'insensitive' } });
                        }
                    } else {
                        andConditions.push({ category: { equals: effectiveCategory, mode: 'insensitive' } });
                    }
                } catch (err) {
                    // Fallback to exact match on error
                    andConditions.push({ category: { equals: effectiveCategory, mode: 'insensitive' } });
                }
            }
        }

        if (search) {
            andConditions.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { vin: { contains: search, mode: 'insensitive' } },
                    { partNumber: { contains: search, mode: 'insensitive' } }
                ]
            });
        }

        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        if (region && region !== 'All' && region !== 'Все') {
            const rLower = region.toLowerCase();
            let regionFilter;
            if (rLower.includes('tashkent region') || rLower.includes('ташкентская') || rLower.includes('toshkent viloyati')) {
                regionFilter = { in: ['Tashkent Region', 'Ташкентская область', 'Tashkent viloyati'] };
            } else if (rLower.includes('tashkent') || rLower.includes('ташкент') || rLower.includes('toshkent')) {
                // Must be exact Tashkent city, but some people write 'г.Ташкент'
                regionFilter = { in: ['Tashkent', 'Ташкент', 'г.Ташкент', 'Toshkent', 'г. Ташкент'] };
            } else if (rLower.includes('samarkand') || rLower.includes('самарканд') || rLower.includes('samarqand')) {
                regionFilter = { in: ['Samarkand', 'Самарканд', 'Самаркандская область', 'Samarqand'] };
            } else if (rLower.includes('bukhara') || rLower.includes('бухара') || rLower.includes('buxoro')) {
                regionFilter = { in: ['Bukhara', 'Бухара', 'Бухарская область', 'Buxoro'] };
            } else if (rLower.includes('andijan') || rLower.includes('андижан') || rLower.includes('andijon')) {
                regionFilter = { in: ['Andijan', 'Андижан', 'Андижанская область', 'Andijon'] };
            } else if (rLower.includes('fergana') || rLower.includes('фергана') || rLower.includes('farg')) {
                regionFilter = { in: ['Fergana', 'Фергана', 'Ферганская область', "Farg'ona", "Fargona"] };
            } else {
                regionFilter = region;
            }
            where.region = regionFilter;
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
        const isAutoGroup = ["cars", "transport", "автомобили", "транспорт", "avtomobil", "avto", "с пробегом", "автосалон", "бозор", "moto", "машины", "седан", "sedan", "suv", "внедорожник"].some(s => catLower.includes(s));
        const isRealEstateGroup = ["real estate", "apartments", "houses", "недвижимость", "uy", "joy", "новостройки", "вторичные", "вторичное жильё", "аренда", "участки", "вторичка", "квартира"].some(s => catLower.includes(s));

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

                if (subcategory && subcategory !== 'Все' && subcategory !== '') {
                    carFilters.push({ path: ['type'], equals: subcategory });
                }

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

            if (subcategory && subcategory !== 'Все' && subcategory !== '') {
                reFilters.push({ path: ['type'], equals: subcategory });
            }

            if (reFilters.length > 0) {
                if (!where.AND) where.AND = [];
                reFilters.forEach(f => where.AND.push({ specs: f }));
            }
        }

        const orderBy = [
            { isFeatured: 'desc' },
            sort === 'price_asc' ? { price: 'asc' }
                : sort === 'price_desc' ? { price: 'desc' }
                    : { createdAt: 'desc' }
        ];

        try {
            const listings = await prisma.marketplace.findMany({
                where,
                include: { owner: { select: { name: true, phone: true, storeName: true } } },
                orderBy,
                skip: (page - 1) * limit,
                take: parseInt(limit)
            });

            const total = await prisma.marketplace.count({ where });

            return {
                listings,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error("❌ [MarketplaceService] findMany Error details:", error);
            if (error.code) console.error("Prisma Error Code:", error.code);
            if (error.meta) console.error("Prisma Error Meta:", error.meta);
            throw error;
        }
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

    async updateCategory(id, data) {
        const updateData = {};
        if (data.name) updateData.name = data.name;
        if (data.subcategories) updateData.subcategories = JSON.stringify(data.subcategories);
        
        return prisma.category.update({
            where: { id },
            data: updateData
        });
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

    async getPartners(category) {
        const where = {
            role: 'PARTNER',
            isBlocked: false
        };

        if (category && category !== 'Все' && category !== 'All') {
            where.businessCategory = category;
        }

        return prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                storeName: true,
                storeLogo: true,
                businessCategory: true,
                businessDescription: true,
                isPhoneVerified: true,
                isOfficial: true, // If we added this
                createdAt: true,
                rating: true, // We should add rating to User too or calculate it
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}


module.exports = new MarketplaceService();
