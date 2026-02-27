class APIError extends Error {
    constructor(status, message, details = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.details = details;
        this.isOperational = true; // Distinguish from programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends APIError {
    constructor(message, details) {
        super(400, message, details);
        this.name = 'ValidationError';
    }
}

class AuthenticationError extends APIError {
    constructor(message = 'Authentication required') {
        super(401, message);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends APIError {
    constructor(message = 'Insufficient permissions') {
        super(403, message);
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends APIError {
    constructor(resource = 'Resource') {
        super(404, `${resource} not found`);
        this.name = 'NotFoundError';
    }
}

class ConflictError extends APIError {
    constructor(message = 'Resource conflict') {
        super(409, message);
        this.name = 'ConflictError';
    }
}

module.exports = {
    APIError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError
};
