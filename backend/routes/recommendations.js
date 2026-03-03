const express = require('express');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

// Get items catalog
router.get('/items', recommendationController.getItemsCatalog);

// Get recommendations for a cart
router.get('/cart', recommendationController.getCartRecommendations);

// Get recommendations for a user
router.get('/user/:userId', recommendationController.getUserRecommendations);

// Get personalized recommendations
router.post('/user/:userId/personalized', recommendationController.getPersonalizedRecommendations);

// Get similar restaurants
router.get('/similar/:restaurantId', recommendationController.getSimilarRestaurants);

// Get recommendations by cuisine
router.get('/cuisine/:cuisine', recommendationController.getRecommendationsByCuisine);

// Get trending restaurants
router.get('/trending', recommendationController.getTrendingRestaurants);

// Get group recommendations
router.post('/group', recommendationController.getGroupRecommendations);

// Health check
router.get('/health', recommendationController.healthCheck);

module.exports = router;
