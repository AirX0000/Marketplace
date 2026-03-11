console.log('🔹 Loading config/database.js');
const { PrismaClient } = require('@prisma/client');
console.log('🔹 Loaded PrismaClient');
const logger = require('../utils/logger');
console.log('🔹 Loaded logger');

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
}

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;

