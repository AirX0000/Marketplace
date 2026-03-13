const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
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
        directUrl.searchParams.set('sslmode', 'require');
        directUrl.searchParams.delete('pgbouncer');
        directUrl.searchParams.delete('connection_limit');
        process.env.DIRECT_URL = directUrl.toString();

        // Map DATABASE_URL for regular app queries. We use local Prisma pooling (connection_limit=3)
        // to avoid exhausting DO's native 15-connection limit.
        const poolUrl = new URL(dbUrlStr);
        poolUrl.searchParams.set('sslmode', 'require');
        if (poolUrl.port === '25061') {
             poolUrl.searchParams.set('pgbouncer', 'true');
        } else {
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

// Mount all at /api
const apiRouter = express.Router();

apiRouter.use('/', marketplaceRoutes); // provides /listings, /categories, /regions
apiRouter.use('/user', userRoutes.userRouter);
apiRouter.use('/admin', userRoutes.adminRouter);
apiRouter.use('/orders', orderRoutes);
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

// Catch-all for API 404s before it hits the SPA index.html fallback
apiRouter.use((req, res) => {
    console.warn(`[API 404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'API Route Not Found', path: req.originalUrl });
});

app.use('/api', apiRouter);

// SPA Fallback - Serve index.html for any unknown non-API routes
const distPath = path.join(__dirname, '../dist');
console.log('🔹 Static assets directory:', distPath);

app.use(express.static(distPath));

app.get('*', (req, res) => {
    // Disable caching for index.html to ensure users always get the latest version
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is ready! Visit http://localhost:${PORT}`);
});
