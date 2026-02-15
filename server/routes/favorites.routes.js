const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', favoritesController.getFavorites);
router.post('/', favoritesController.addFavorite);
router.delete('/:marketplaceId', favoritesController.removeFavorite);

module.exports = router;
