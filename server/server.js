const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const compression = require('compression');
const { Server } = require('socket.io');
require('dotenv').config();

// --- DIGITALOCEAN PRISMA CONNECTION ROUTING ---
// Ensures the application uses Prisma's local connection pooling to prevent DO database exhaustion.
if (process.env.DATABASE_URL) {
    try {
        const { URL } = require('url');
        let dbUrlStr = process.env.DATABASE_URL;
        const dbUrl = new URL(dbUrlStr);

        // Map DIRECT_URL (must not have pgbouncer=true)
        const directUrl = new URL(dbUrlStr);
        if (!directUrl.hostname.includes('localhost') && !directUrl.hostname.includes('127.0.0.1')) {
            directUrl.searchParams.set('sslmode', 'require');
        } else {
            directUrl.searchParams.set('sslmode', 'disable');
        }
        directUrl.searchParams.delete('pgbouncer');
        directUrl.searchParams.delete('connection_limit');
        process.env.DIRECT_URL = directUrl.toString();

        // Map DATABASE_URL for regular app queries. We use local Prisma pooling (connection_limit=3)
        // to avoid exhausting DO's native 15-connection limit.
        const poolUrl = new URL(dbUrlStr);
        if (!poolUrl.hostname.includes('localhost') && !poolUrl.hostname.includes('127.0.0.1')) {
            poolUrl.searchParams.set('sslmode', 'require');
            if (poolUrl.port === '25061') {
                 poolUrl.searchParams.set('pgbouncer', 'true');
            } else {
                 poolUrl.searchParams.delete('pgbouncer');
            }
        } else {
            poolUrl.searchParams.set('sslmode', 'disable');
            poolUrl.searchParams.delete('pgbouncer');
        }
        poolUrl.searchParams.set('connection_limit', '3'); // Strict local limit
        poolUrl.searchParams.set('pool_timeout', '10');
        process.env.DATABASE_URL = poolUrl.toString();
        
        console.log('[Server Config] Routed connections with safe limits applied.');
    } catch (e) {
        console.error('[Server Config] Error parsing database URLs:', e.message);
    }
}

const app = express();
const PORT = process.env.PORT || 3000; // Use DO provided port, fallback to 3000

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://api-maps.yandex.ru", "https://yastatic.net"],
            "script-src-elem": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://api-maps.yandex.ru", "https://yastatic.net"],
            "img-src": ["'self'", "data:", "https:", "cdn.payme.uz", "cdn.click.uz", "checkout.paycom.uz", "my.click.uz"],
            "connect-src": ["'self'", "https:", "ws:", "wss:", "cdn.payme.uz", "cdn.click.uz", "checkout.paycom.uz", "my.click.uz", "https://api-maps.yandex.ru"],
            "frame-src": ["'self'"],
        },
    },
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes registration
const marketplaceRoutes = require('./routes/marketplace.routes');
const userRoutes = require('./routes/user.routes');
const orderRoutes = require('./routes/order.routes');
const partnerRoutes = require('./routes/partner.routes');
const paymentRoutes = require('./routes/payment.routes');
const walletRoutes = require('./routes/wallet');
const favoritesRoutes = require('./routes/favorites.routes');
const aiRoutes = require('./routes/ai.routes');
const chatRoutes = require('./routes/chat.routes');
const loanRoutes = require('./routes/loan.routes');
const returnRoutes = require('./routes/return.routes');
const reviewRoutes = require('./routes/review.routes');
const settingsRoutes = require('./routes/settings.routes');
const supportRoutes = require('./routes/support.routes');
const centersRoutes = require('./routes/centers.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const contentRoutes = require('./routes/content.routes');
const passwordResetRoutes = require('./routes/password_reset.routes');
const uploadRoutes = require('./routes/upload.routes');
const seoRoutes = require('./routes/seo.routes');
const leadsRoutes = require('./routes/leads.routes');
const bannerRoutes = require('./routes/banner.routes');
const offerRoutes = require('./routes/offer.routes');

// Mount all at /api
const apiRouter = express.Router();

apiRouter.use('/', marketplaceRoutes); // provides /listings, /categories, /regions
apiRouter.use('/user', userRoutes.userRouter);
apiRouter.use('/admin/newsletter', newsletterRoutes);
apiRouter.use('/admin', userRoutes.adminRouter);
const adminFinanceRoutes = require('./routes/admin.finance');
apiRouter.use('/admin/finance', adminFinanceRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/offers', offerRoutes);
apiRouter.use('/', partnerRoutes); // partnerRoutes already has /partner and /partners internally
apiRouter.use('/payment', paymentRoutes);
apiRouter.use('/wallet', walletRoutes);
apiRouter.use('/favorites', favoritesRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/loans', loanRoutes);
apiRouter.use('/returns', returnRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/support', supportRoutes);
apiRouter.use('/centers', centersRoutes);
apiRouter.use('/newsletter', newsletterRoutes);
// Note: also mounted under /admin/newsletter below to match frontend admin calls
apiRouter.use('/', contentRoutes); // Mount at root so /careers and /blog work as expected by the frontend
// Auth routes (login/register/otp)
try {
    const authRoutes = require('./routes/auth.routes');
    apiRouter.use('/auth', authRoutes);
} catch (e) {
    console.warn('⚠️ auth.routes.js load failed');
}

apiRouter.use('/auth', passwordResetRoutes); // Password reset routes (e.g. /auth/reset)
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/seo', seoRoutes);
apiRouter.use('/leads', leadsRoutes);
apiRouter.use('/banners', bannerRoutes);

// Catch-all for API 404s before it hits the SPA index.html fallback
apiRouter.use((req, res) => {
    console.warn(`[API 404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'API Route Not Found', path: req.originalUrl });
});

app.use('/api', apiRouter);

// Sitemap.xml at root (for Google Search Console)
app.get('/sitemap.xml', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient({
            log: ['error', 'warn'],
        });
        const baseUrl = 'https://autohouse.uz';
        const staticRoutes = ['/', '/catalog', '/marketplaces', '/about', '/contacts', '/blog', '/mortgage', '/partners', '/help'];
        const [marketplaces, blogs] = await Promise.all([
            prisma.marketplace.findMany({ where: { status: 'APPROVED' }, select: { slug: true, id: true, updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 5000 }),
            prisma.blogPost.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true }, take: 200 }).catch(() => [])
        ]);
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        staticRoutes.forEach(r => { xml += `  <url><loc>${baseUrl}${r}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`; });
        marketplaces.forEach(m => {
            const loc = m.slug ? `/marketplaces/${m.slug}` : `/marketplaces/${m.id}`;
            const d = m.updatedAt ? new Date(m.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            xml += `  <url><loc>${baseUrl}${loc}</loc><lastmod>${d}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
        });
        blogs.forEach(b => {
            const d = b.updatedAt ? new Date(b.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            xml += `  <url><loc>${baseUrl}/blog/${b.id}</loc><lastmod>${d}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
        });
        xml += '</urlset>';
        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (e) {
        res.status(500).send('Sitemap error');
    }
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /profile\nDisallow: /api/\nSitemap: https://autohouse.uz/sitemap.xml\n`);
});

// SPA Fallback - Serve index.html for any unknown non-API routes
const distPath = path.join(__dirname, '../dist');
console.log('🔹 Static assets directory:', distPath);

const jwt = require('jsonwebtoken'); // Added for Socket.io auth
const env = require('./config/env');

// Cache static assets (CSS, JS, Images) for 1 year if they are fingerprinted
app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true,
    immutable: true,
    index: false
}));

app.get('*', (req, res) => {
    // Disable caching for index.html to ensure users always get the latest version
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    res.sendFile(path.join(distPath, 'index.html'));
});

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// EXPOSE GLOBALLY FOR SERVICES
global.io = io;

// Socket.io Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    jwt.verify(token, env.jwtSecret, (err, decoded) => {
        if (err) return next(new Error('Authentication error: Invalid token'));
        socket.user = decoded;
        next();
    });
});

io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?.userId;
    console.log(`[Socket] Connected: ${socket.id} (User: ${userId})`);

    if (userId) {
        socket.join(userId);
        console.log(`[Socket] User ${userId} auto-joined their personal room`);
    }

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`[Socket] User ${socket.user?.userId} joined room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        const { roomId, content } = data;
        // Broadcast to room
        io.to(roomId).emit('receive_message', {
            id: Date.now().toString(),
            chatRoomId: roomId,
            content,
            senderId: socket.user?.userId,
            createdAt: new Date().toISOString()
        });
    });

    socket.on('disconnect', () => {
        console.log('[Socket] Disconnected:', socket.id);
    });
});

// Global Error Handler
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is ready! Visit http://localhost:${PORT}`);
});
