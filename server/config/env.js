const fs = require('fs');
const path = require('path');

// Manual .env parser to avoid dotenv hang
try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const val = values.join('=').trim().replace(/^["'](.+)["']$/, '$1'); // Remove quotes
                if (!process.env[key.trim()]) {
                    process.env[key.trim()] = val;
                }
            }
        });
        console.log('✅ Loaded .env manually');
    }
} catch (e) {
    console.error('Failed to load .env manually:', e);
}

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    databaseUrl: process.env.DATABASE_URL,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY
};
