const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://autohouse.uz';

        // Static routes
        const staticRoutes = [
            '/',
            '/catalog',
            '/about',
            '/contacts',
            '/blog',
            '/mortgage',
        ];

        // Fetch dynamic slugs
        const marketplaces = await prisma.marketplace.findMany({
            where: { status: 'APPROVED' },
            select: { slug: true, id: true, updatedAt: true }
        });

        // Generate XML string
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static routes
        staticRoutes.forEach(route => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${route}</loc>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Add dynamic marketplace routes
        marketplaces.forEach(item => {
            const loc = item.slug ? `/marketplaces/${item.slug}` : `/marketplaces/${item.id}`;
            const date = item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${loc}</loc>\n`;
            xml += `    <lastmod>${date}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).end();
    }
});

module.exports = router;
