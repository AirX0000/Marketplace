const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB for high-res phone photos
    fileFilter: (req, file, cb) => {
        // Accept all types of images, including HEIC/HEIF from iPhones and modern formats like AVIF
        const isImage = file.mimetype.startsWith('image/') || 
                        /heic|heif|avif|tiff|svg/i.test(file.mimetype) ||
                        /heic|heif|jpeg|jpg|png|webp|bmp|gif|avif|tiff|svg|jfif|jpe/i.test(path.extname(file.originalname));
        
        if (isImage) {
            return cb(null, true);
        }
        cb(new Error('Разрешены только изображения (jpeg, png, webp, heic, avif и т.д.)!'));
    }
});


// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the relative URL for the uploaded file
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            url: fileUrl,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

module.exports = router;
