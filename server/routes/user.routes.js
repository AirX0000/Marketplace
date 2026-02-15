const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// User Profile
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

// User Addresses
router.get('/addresses', authenticateToken, userController.getAddresses);
router.post('/addresses', authenticateToken, userController.addAddress);
router.delete('/addresses/:id', authenticateToken, userController.deleteAddress);

// Wishlist Sharing
router.get('/wishlist/:userId', userController.getSharedFavorites); // Public
router.put('/wishlist/privacy', authenticateToken, userController.toggleWishlistPrivacy);

// Admin Routes (mounted at /api/admin)
const adminRouter = express.Router();

adminRouter.use(authenticateToken, authorizeRole(['ADMIN']));

adminRouter.get('/users', adminController.getAllUsers);
adminRouter.put('/users/:id/role', adminController.updateUserRole);
adminRouter.put('/users/:id/block', adminController.toggleBlockUser);
adminRouter.delete('/users/:id', adminController.deleteUser);
adminRouter.get('/marketplaces', adminController.getMarketplaces);
adminRouter.delete('/marketplaces/:id', adminController.deleteMarketplace);
adminRouter.put('/marketplaces/:id/status', adminController.updateMarketplaceStatus);
adminRouter.get('/stats', adminController.getStats);



module.exports = {
    userRouter: router,
    adminRouter: adminRouter
};
