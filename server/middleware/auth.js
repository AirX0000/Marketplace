const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`[AUTH_DEBUG] Path: ${req.path}, Header: ${authHeader ? 'Present' : 'Missing'}`);

    if (!token) {
        console.warn(`[AUTH_DEBUG] No token provided for ${req.path}`);
        return res.sendStatus(401);
    }

    jwt.verify(token, env.jwtSecret, (err, user) => {
        if (err) {
            console.error(`[AUTH_DEBUG] Token verification failed for ${req.path}:`, err.message);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return res.sendStatus(401);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
};

const requireAdmin = (req, res, next) => {
    if (!req.user) return res.sendStatus(401);
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

const requireSuperAdmin = (req, res, next) => {
    if (!req.user) return res.sendStatus(401);
    console.log(`[DEBUG_AUTH] User: ${req.user.userId}, Role: ${req.user.role}, Target: SUPER_ADMIN`);
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Super Admin access required' });
    }
    next();
};

module.exports = { authenticateToken, authorizeRole, requireAdmin, requireSuperAdmin };
