// Minimal replacement for Winston to fix build hang
const consoleFormat = (level, message, meta) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${meta ? JSON.stringify(meta) : ''}`;
};

const logger = {
    info: (msg, meta) => console.log(consoleFormat('info', msg, meta)),
    error: (msg, meta) => console.error(consoleFormat('error', msg, meta)),
    warn: (msg, meta) => console.warn(consoleFormat('warn', msg, meta)),
    debug: (msg, meta) => console.debug(consoleFormat('debug', msg, meta)),
    stream: {
        write: (message) => console.log(consoleFormat('http', message.trim()))
    }
};

module.exports = logger;
