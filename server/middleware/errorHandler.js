const logger = require('../utils/logger');

// Async handler wrapper to catch errors in async routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Centralized error handler middleware
const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.user?.userId,
    });

    // Check if headers already sent
    if (res.headersSent) {
        return next(err);
    }

    // Determine status and message
    let status = err.status || err.statusCode || 500;
    let message = err.message;

    // Handle Prisma Errors
    if (err.code) {
        if (err.code === 'P2002') {
            status = 409;
            const target = err.meta?.target ? ` on ${err.meta.target}` : '';
            message = `Unique constraint violation${target}`;
        } else if (err.code === 'P2025') {
            status = 404;
            message = 'Record not found';
        }
    }

    if (!err.isOperational && status === 500) {
        message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
    }

    // Prepare response
    const response = {
        error: message,
        ...(err.details && { details: err.details }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    };

    res.status(status).json(response);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
};

module.exports = {
    asyncHandler,
    errorHandler,
    notFoundHandler
};
