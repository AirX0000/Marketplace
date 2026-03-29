const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/sitemap.xml', asyncHandler(async (req, res) => {
    const baseUrl = 'https://autohouse.uz';

    // Static routes
    const staticRoutes = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/catalog', priority: '0.9', changefreq: 'daily' },
        { url: '/marketplaces', priority: '0.9', changefreq: 'daily' },
        { url: '/mortgage', priority: '0.8', changefreq: 'weekly' },
        { url: '/blog', priority: '0.7', changefreq: 'daily' },
        { url: '/about', priority: '0.5', changefreq: 'monthly' },
        { url: '/contacts', priority: '0.5', changefreq: 'monthly' },
    ];

    // Fetch dynamic slugs
    const marketplaces = await prisma.marketplace.findMany({
        where: { status: 'APPROVED' },
        select: { slug: true, id: true, updatedAt: true, name: true, image: true }
    });

    // Generate XML string with Image Namespace
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Add static routes
    staticRoutes.forEach(route => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
        xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
        xml += `    <priority>${route.priority}</priority>\n`;
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
        xml += '    <priority>0.8</priority>\n';
        
        if (item.image) {
            xml += '    <image:image>\n';
            xml += `      <image:loc>${item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`}</image:loc>\n`;
            xml += `      <image:title>${item.name.replace(/[<>&"']/g, '')}</image:title>\n`;
            xml += '    </image:image>\n';
        }
        
        xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
}));

module.exports = router;
