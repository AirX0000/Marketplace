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
    return url;
}

const prisma = new PrismaClient({
    datasourceUrl: getDatabaseUrlWithLimits(),
    log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;

