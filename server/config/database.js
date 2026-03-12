console.log('🔹 Loading config/database.js');

// Database URL routing is now strictly handled at the top of server.js
// before any routes or services are initialized.

const { PrismaClient } = require('@prisma/client');
console.log('🔹 Loaded PrismaClient');
const logger = require('../utils/logger');
console.log('🔹 Loaded logger');


const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;

