const cache = require('../services/cache.service');

// GET all active banners (for frontend)
router.get('/', asyncHandler(async (req, res) => {
    const cachedBanners = cache.get(cache.KEYS.BANNERS);
    if (cachedBanners) return res.json(cachedBanners);

    const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });
    cache.set(cache.KEYS.BANNERS, banners);
    res.json(banners);
}));

// Admin: GET all banners including inactive
router.get('/admin', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
    const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } });
    res.json(banners);
}));

// Admin: CREATE banner
router.post('/', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
    const { title, imageUrl, link, isActive, order } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });
    const banner = await prisma.banner.create({
        data: { title, imageUrl, link: link || '/marketplaces', isActive: isActive !== false, order: order || 0 }
    });
    cache.del(cache.KEYS.BANNERS); // Invalidate cache
    res.status(201).json(banner);
}));

// Admin: UPDATE banner
router.patch('/:id', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
    const { title, imageUrl, link, isActive, order } = req.body;
    const banner = await prisma.banner.update({
        where: { id: req.params.id },
        data: {
            ...(title !== undefined && { title }),
            ...(imageUrl !== undefined && { imageUrl }),
            ...(link !== undefined && { link }),
            ...(isActive !== undefined && { isActive }),
            ...(order !== undefined && { order }),
        }
    });
    cache.del(cache.KEYS.BANNERS); // Invalidate cache
    res.json(banner);
}));

// Admin: DELETE banner
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), asyncHandler(async (req, res) => {
    await prisma.banner.delete({ where: { id: req.params.id } });
    cache.del(cache.KEYS.BANNERS); // Invalidate cache
    res.json({ success: true });
}));

module.exports = router;
