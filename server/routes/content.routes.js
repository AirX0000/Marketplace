const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public
router.get('/careers', contentController.getJobs);
router.get('/blog', contentController.getPosts);
router.get('/blog/:id', contentController.getPostById);
router.get('/pages/:slug', contentController.getPage);

// Admin - Careers
// Using specific paths to avoid collision if mounted at /api/content
router.post('/careers', authenticateToken, authorizeRole(['ADMIN']), contentController.createJob);
router.put('/careers/:id', authenticateToken, authorizeRole(['ADMIN']), contentController.updateJob);
router.delete('/careers/:id', authenticateToken, authorizeRole(['ADMIN']), contentController.deleteJob);

// Admin - Blog
router.post('/blog', authenticateToken, authorizeRole(['ADMIN']), contentController.createPost);
router.put('/blog/:id', authenticateToken, authorizeRole(['ADMIN']), contentController.updatePost);
router.delete('/blog/:id', authenticateToken, authorizeRole(['ADMIN']), contentController.deletePost);

// Admin - Pages
router.put('/pages/:slug', authenticateToken, authorizeRole(['ADMIN']), contentController.updatePage);

module.exports = router;
