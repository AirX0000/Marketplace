const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000; // Force 3000 to match DigitalOcean component config, bypassing Heroku buildpack's PORT=8080 injection

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:", "cdn.payme.uz", "cdn.click.uz", "checkout.paycom.uz", "my.click.uz"],
            "connect-src": ["'self'", "https:", "cdn.payme.uz", "cdn.click.uz", "checkout.paycom.uz", "my.click.uz"],
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
apiRouter.use('/content', contentRoutes);
// Auth routes (login/register/otp)
try {
    const authRoutes = require('./routes/auth.routes');
    apiRouter.use('/auth', authRoutes);
} catch (e) {
    console.warn('⚠️ auth.routes.js load failed');
}

apiRouter.use('/auth', passwordResetRoutes); // Password reset routes (e.g. /auth/reset)
apiRouter.use('/upload', uploadRoutes);

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
