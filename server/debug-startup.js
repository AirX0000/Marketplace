const fs = require('fs');
function log(msg) {
    fs.writeSync(1, msg + '\n');
}

log('START: Loading modules...');
try {
    log('Req express'); const express = require('express');
    log('Req cors'); const cors = require('cors');
    log('Req helmet'); const helmet = require('helmet');
    log('Req hpp'); const hpp = require('hpp');
    log('Req morgan'); const morgan = require('morgan');
    log('Req rate-limit'); const rateLimit = require('express-rate-limit');
    log('Req path'); const path = require('path');
    log('Req http'); const http = require('http');
    log('Req socket.io'); const { Server } = require('socket.io');
    log('Req multer'); const multer = require('multer');
    log('Req jwt'); const jwt = require('jsonwebtoken');

    log('Req config/env'); require('./config/env');
    log('Req config/database'); const prisma = require('./config/database');
    log('Req seed-defaults'); const { seedDefaults } = require('./seed-defaults');

    log('DONE: All requires passed.');
} catch (e) {
    log('CRASHED during requires: ' + e.message);
}
