console.log('START MINI SERVER');
try {
    console.log('Loading express...');
    const express = require('express');

    console.log('Loading bcryptjs...');
    const bcrypt = require('bcryptjs');
    console.log('✅ bcryptjs loaded');

    console.log('Loading jsonwebtoken...');
    const jwt = require('jsonwebtoken');
    console.log('✅ jsonwebtoken loaded');

    console.log('Loading zod...');
    const zod = require('zod');
    console.log('✅ zod loaded');

    // ... previous requires ...
    console.log('Loading auth routes...');
    const authRoutes = require('./routes/auth.routes');
    console.log('✅ auth routes loaded');

    // ... previous logs ...
    console.log('Loading database config...');
    const prisma = require('./config/database');
    console.log('✅ database config loaded');

    console.log('Loading email service...');
    const emailService = require('./emailService');
    console.log('✅ email service loaded');

    console.log('Loading partner service...');
    const partnerService = require('./services/partner.service');
    console.log('✅ partner service loaded');

    console.log('Loading partner controller...');
    const partnerController = require('./controllers/partner.controller');
    console.log('✅ partner controller loaded');

    console.log('Loading partner routes...');
    const partnerRoutes = require('./routes/partner.routes');
    console.log('✅ partner routes loaded');
} catch (e) {
    console.error('ERROR LOADING:', e);
}
console.log('DONE');
