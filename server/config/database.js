console.log('🔹 Loading config/database.js');
const { PrismaClient } = require('@prisma/client');
console.log('🔹 Loaded PrismaClient');
const logger = require('../utils/logger');
console.log('🔹 Loaded logger');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;

