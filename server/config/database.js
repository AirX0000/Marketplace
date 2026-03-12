console.log('🔹 Loading config/database.js');

// Function to append connection limits to the database URL if not already present
function getDatabaseUrlWithLimits() {
    let url = process.env.DATABASE_URL;
    if (!url) return url;
    
    // Add connection_limit=3 to prevent DO Postgres pool exhaustion
    if (!url.includes('connection_limit=')) {
        url += url.includes('?') ? '&connection_limit=3' : '?connection_limit=3';
    }
    // Add pool_timeout to avoid hanging connections
    if (!url.includes('pool_timeout=')) {
        url += '&pool_timeout=10';
    }
    // Add pgbouncer=true for DigitalOcean managed databases
    if (!url.includes('pgbouncer=')) {
        url += '&pgbouncer=true';
    }
    return url;
}

// Crucial fix: Prisma sometimes ignores datasourceUrl, so we MUST mutate the env var
// before instantiating the client so that the rust engine picks it up.
const safeUrl = getDatabaseUrlWithLimits();
if (safeUrl) {
    process.env.DATABASE_URL = safeUrl;
    
    // Prisma now requires DIRECT_URL for validation if it's in the schema,
    // even during normal runtime. We derive it safely here.
    if (!process.env.DIRECT_URL) {
        let baseDirect = safeUrl.split('?')[0]; // Strip regular query params
        process.env.DIRECT_URL = baseDirect.replace(':25060', ':25061');
    }
}

const { PrismaClient } = require('@prisma/client');
console.log('🔹 Loaded PrismaClient');
const logger = require('../utils/logger');
console.log('🔹 Loaded logger');


const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;

