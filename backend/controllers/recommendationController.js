const MLService = require('../services/mlService');
const fs = require('fs');
const path = require('path');

const configuredMlUrl = process.env.ML_SERVICE_URL;
const mlServiceBaseUrl = !configuredMlUrl || configuredMlUrl.includes('mlservice.example.com')
  ? 'http://localhost:8000'
  : configuredMlUrl;
const mlService = new MLService(mlServiceBaseUrl);
const ITEMS_PATH = path.resolve(__dirname, '../../ml/data/items.json');
let itemsCache = null;

function loadItems() {
  if (itemsCache) {
    return itemsCache;
  }

  const raw = fs.readFileSync(ITEMS_PATH, 'utf8');
  const items = JSON.parse(raw);
  itemsCache = items.map((item) => ({
    item_id: item.item_id,
    name: item.name
  }));
  return itemsCache;
}

// Get item catalog (id + name)
exports.getItemsCatalog = async (req, res) => {
  try {
    const items = loadItems();
    res.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Items catalog request failed:', error.message);
    res.status(500).json({
      error: 'Failed to load item catalog',
      details: error.message
    });
  }
};

// Get recommendations for an active cart
exports.getCartRecommendations = async (req, res) => {
  try {
    const { cart, top_n = 5 } = req.query;
    if (!cart) {
      return res.status(400).json({ error: 'cart is required' });
    }

    let cartItems = [];
    if (Array.isArray(cart)) {
      cartItems = cart;
    } else if (typeof cart === 'string') {
      cartItems = cart.split(',');
    }

    const parsedCart = cartItems
      .map((item) => parseInt(item, 10))
      .filter((item) => Number.isInteger(item) && item > 0);

    if (parsedCart.length === 0) {
      return res.status(400).json({ error: 'cart must contain valid item ids' });
    }

    const topN = Math.min(Math.max(parseInt(top_n, 10) || 5, 1), 20);
    const recs = await mlService.getCartRecommendations(parsedCart, topN);
    const recommendations = recs.recommendations || recs.restaurants || [];

    res.json({
      success: true,
      cart: parsedCart,
      recommendations,
      count: recommendations.length,
      topN,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Cart recommendation request failed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch cart recommendations',
      details: error.message
    });
  }
};

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
