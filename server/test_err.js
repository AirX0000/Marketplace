const { ValidationError } = require('./utils/errors');
const err = new ValidationError('Phone number is required');
console.log(err.status, err.statusCode, err.isOperational, err.message);
