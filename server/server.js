console.log('--- STARTING SERVER.JS ---');
console.log('require express...');
const express = require('express');
console.log('require cors...');
const cors = require('cors');
console.log('require helmet...');
const helmet = require('helmet');
// const xss = require('xss-clean'); // Deprecated
console.log('require hpp...');
const hpp = require('hpp');
console.log('require morgan...');
const morgan = require('morgan');
console.log('require rate-limit...');
const rateLimit = require('express-rate-limit');
console.log('require path...');
const path = require('path');
console.log('require http...');
const http = require('http');
console.log('require socket.io...');
const { Server } = require('socket.io');
console.log('require fs...');
const fs = require('fs');
console.log('require multer...');
const multer = require('multer');

console.log('require jwt...');
const jwt = require('jsonwebtoken');

// Config
console.log('require env...');
require('./config/env');
const prisma = require('./config/database');
const { seedDefaults } = require('./seed-defaults');

console.log('🚀 Initializing Express app...');
const app = express();
const PORT = process.env.PORT || 3000;

// Uploads Directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
        if (extname && mimetype) return cb(null, true);
        cb('Error: Only images and PDFs are allowed!');
    }
});

// Middleware
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            origin.includes('localhost') ||
            origin.includes('127.0.0.1') ||
            origin.startsWith('http://192.168.') ||
            origin.includes('vercel.app')
        ) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(helmet());
// app.use(xss());
app.use(hpp());
app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Increased for development
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Routes Imports
console.log('🔹 Importing authRoutes...');
const authRoutes = require('./routes/auth.routes');
console.log('🔹 Importing partnerRoutes...');
const partnerRoutes = require('./routes/partner.routes');
console.log('🔹 Importing orderRoutes...');
const orderRoutes = require('./routes/order.routes');
console.log('🔹 Importing marketplaceRoutes...');
const marketplaceRoutes = require('./routes/marketplace.routes');
console.log('🔹 Importing userRoutes...');
const { userRouter, adminRouter } = require('./routes/user.routes');
console.log('🔹 Importing offerRoutes...');
const offerRoutes = require('./routes/offer.routes');
console.log('🔹 Importing supportRoutes...');
const supportRoutes = require('./routes/support.routes');
console.log('🔹 Importing walletRouter...');
const walletRouter = require('./routes/wallet');
console.log('🔹 Importing returnRouter...');
const returnRouter = require('./routes/return.routes');
console.log('🔹 Importing contentRoutes...');
const contentRoutes = require('./routes/content.routes');
console.log('🔹 Importing newsletterRoutes...');
const newsletterRoutes = require('./routes/newsletter.routes');


console.log('🔹 Importing chatRoutes...');
const chatRoutes = require('./routes/chat.routes');
console.log('🔹 Importing favoritesRoutes...');
const favoritesRoutes = require('./routes/favorites.routes');
console.log('🔹 Importing centersRoutes...');
const centersRoutes = require('./routes/centers.routes');
console.log('🔹 Importing aiRoutes...');
const aiRoutes = require('./routes/ai.routes');
console.log('🔹 Importing adminPartnersRoutes...');
const adminPartnersRoutes = require('./routes/admin-partners.routes');
console.log('🔹 Importing adminFinanceRouter...');
const adminFinanceRouter = require('./routes/admin.finance');
console.log('🔹 Importing loanRoutes...');
const loanRoutes = require('./routes/loan.routes');
console.log('🔹 Importing errorHandler...');
const { errorHandler } = require('./middleware/errorHandler');
console.log('✅ All routes imported');


// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api', marketplaceRoutes); // /api/listings, /api/categories, /api/regions
app.use('/api', partnerRoutes); // /api/partner/..., /api/partners/:id
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/newsletter', newsletterRoutes); // /api/admin/newsletter/broadcast


app.use('/api/admin', contentRoutes); // /api/admin/blog, /api/admin/careers
app.use('/api/admin/finance', adminFinanceRouter);
app.use('/api/admin/centers', centersRoutes); // /api/admin/centers CRUD
app.use('/api/centers', centersRoutes); // /api/centers public list
app.use('/api/wallet', walletRouter);
app.use('/api/returns', returnRouter);
app.use('/api/chat', chatRoutes);
app.use('/api/offers', offerRoutes); // /api/offers
app.use('/api/tickets', supportRoutes); // /api/tickets
app.use('/api/ai', aiRoutes);
app.use('/api/admin/partners', adminPartnersRoutes); // Partner account management
app.use('/api', contentRoutes); // /api/blog, /api/careers (public)
app.use('/api/loans', loanRoutes);


// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});





// Root
app.get('/', (req, res) => {
    res.send('Marketplace API is running (Modularized 🚀)');
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: "Endpoint not found" });
});

// Error Handler (Centralized)
app.use(errorHandler);


// Start Server
// Start Server (HTTP + Socket.IO)
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.IO Middleware for Auth
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new Error("Authentication error"));
    }
    const env = require('./config/env');
    jwt.verify(token, env.jwtSecret, (err, decoded) => {
        if (err) return next(new Error("Authentication error"));
        socket.user = decoded; // { userId, role, ... }
        next();
    });
});

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.userId} (${socket.id})`);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        // data: { roomId, content }
        const { roomId, content } = data;
        const senderId = socket.user.userId;

        // Save to DB
        try {
            const message = await prisma.chatMessage.create({
                data: {
                    chatRoomId: roomId,
                    senderId, // Trusted from token
                    content
                },
                include: {
                    sender: { select: { id: true, name: true, avatar: true } }
                }
            });

            // Update Room last message
            await prisma.chatRoom.update({
                where: { id: roomId },
                data: {
                    lastMessage: content,
                    lastMessageAt: new Date()
                }
            });

            // Broadcast to room
            io.to(roomId).emit('receive_message', message);
        } catch (e) {
            console.error('Socket message error:', e);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, '0.0.0.0', async () => {
    console.log(`✅ Server (HTTP+Socket) listening on 0.0.0.0:${PORT}`);

    // Connect to database in background
    (async () => {
        try {
            console.log('🔌 Connecting to database...');
            await prisma.$connect();
            console.log('✅ Database connected successfully');
            await seedDefaults(prisma);
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            console.error('Check your DATABASE_URL and Supabase connection limits.');
        }
    })();

    console.log(`🎉 Server is ready for port scanning!`);
});

server.on('error', (err) => {
    console.error('Server failed to start:', err);
});
