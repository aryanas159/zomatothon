const MLService = require('../services/mlService');

// const mlService = new MLService(process.env.ML_SERVICE_URL);
const mlService = new MLService(process.env.ML_SERVICE_URL || 'http://localhost:8000');

// Get recommendations for a user
exports.getUserRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log(`🔍 Requesting recommendations for user ${userId} from ML service...`);

    const recommendations = await mlService.getRecommendations(userId, {
      limit: parseInt(limit)
    });

    console.log(`✅ Received ${recommendations.restaurants?.length || 0} recommendations`);

    res.json({
      success: true,
      userId,
      recommendations: recommendations.restaurants || [],
      count: recommendations.restaurants?.length || 0,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Recommendation request failed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch recommendations',
      details: error.message
    });
  }
};

// Get personalized recommendations
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cuisinePreferences, priceRange, rating, location } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log(`🎯 Requesting personalized recommendations for user ${userId}...`);

    const userProfile = {
      cuisine_preferences: cuisinePreferences || [],
      price_range: priceRange || 'medium',
      minimum_rating: rating || 3.0,
      location: location || null
    };

    const recommendations = await mlService.getPersonalizedRecommendations(userId, userProfile);

    res.json({
      success: true,
      userId,
      profile: userProfile,
      recommendations: recommendations.restaurants || [],
      count: recommendations.restaurants?.length || 0,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Personalized recommendation request failed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch personalized recommendations',
      details: error.message
    });
  }
};

// Get similar restaurants
exports.getSimilarRestaurants = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { limit = 5 } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId is required' });
    }

    console.log(`🔗 Finding restaurants similar to ${restaurantId}...`);

    const recommendations = await mlService.getSimilarRestaurants(restaurantId, parseInt(limit));

    res.json({
      success: true,
      baseRestaurantId: restaurantId,
      similarRestaurants: recommendations.restaurants || [],
      count: recommendations.restaurants?.length || 0,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Similar restaurants request failed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch similar restaurants',
      details: error.message
    });
  }
};

// Get recommendations by cuisine
exports.getRecommendationsByCuisine = async (req, res) => {
  try {
    const { cuisine } = req.params;
    const { limit = 10, ratingMin, priceRange } = req.query;

    if (!cuisine) {
      return res.status(400).json({ error: 'cuisine is required' });
    }

    console.log(`🍜 Finding ${cuisine} restaurants with filtering...`);

    const recommendations = await mlService.getRecommendationsByCuisine(cuisine, {
      limit: parseInt(limit),
      ratingMin: parseFloat(ratingMin) || 0,
      priceRange: priceRange || null
    });

    res.json({
      success: true,
      cuisine,
      recommendations: recommendations.restaurants || [],
      count: recommendations.restaurants?.length || 0,
      filters: {
        limit,
        minRating: ratingMin,
        priceRange
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Cuisine recommendation request failed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch cuisine recommendations',
      details: error.message
    });
  }
};

// Get trending restaurants
exports.getTrendingRestaurants = async (req, res) => {
  try {
    const { limit = 10, location } = req.query;

    console.log(`🔥 Fetching trending restaurants...`);

    const recommendations = await mlService.getTrendingRestaurants(parseInt(limit), location);

    res.json({
      success: true,
      trending: recommendations.restaurants || [],
      count: recommendations.restaurants?.length || 0,
      location: location || 'all',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Trending restaurants request failed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch trending restaurants',
      details: error.message
    });
  }
};

// Get group recommendations
exports.getGroupRecommendations = async (req, res) => {
  try {
    const { userIds } = req.body;
    const { limit = 5 } = req.query;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    console.log(`👥 Finding common restaurant recommendations for ${userIds.length} users...`);

    const recommendations = await mlService.getGroupRecommendations(userIds, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      userCount: userIds.length,
      recommendations: recommendations.restaurants || [],
      count: recommendations.restaurants?.length || 0,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Group recommendation request failed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch group recommendations',
      details: error.message
    });
  }
};

// Health check
exports.healthCheck = async (req, res) => {
  try {
    const status = await mlService.healthCheck();
    res.json({
      success: true,
      mlServiceStatus: status,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'ML Service is unavailable',
      details: error.message
    });
  }
};