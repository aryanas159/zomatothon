const axios = require('axios');

class MLService {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Get recommendations for a user
  async getRecommendations(userId, options = {}) {
    try {
      // UPDATED: Changed .post() to .get() and fixed the path to match your @app.get("/recommend/user/{userId}")
      const response = await this.client.get(`/recommend/user/${userId}`, {
        params: { limit: options.limit || 10 }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  // Get personalized recommendations based on user preferences
  async getPersonalizedRecommendations(userId, userProfile) {
    try {
      const response = await this.client.get('/personalized-recommendations', {
        user_id: userId,
        profile: userProfile
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get personalized recommendations: ${error.message}`);
    }
  }

  // Get similar restaurants based on one restaurant
  async getSimilarRestaurants(restaurantId, limit = 5) {
    try {
      // UPDATED: Changed .post() to .get() and fixed the path to match your @app.get("/recommend/similar/{restaurantId}")
      const response = await this.client.get(`/recommend/similar/${restaurantId}`, {
        params: { limit: limit }
      });
      return response.data;
    } catch (error) {
      // This will now successfully hit http://localhost:8000/recommend/similar/10
      throw new Error(`Failed to get similar restaurants: ${error.message}`);
    }
  }

  // Get recommendations based on cuisine type
  async getRecommendationsByCuisine(cuisine, options = {}) {
    try {
      const response = await this.client.get('/recommendations-by-cuisine', {
        cuisine,
        limit: options.limit || 10,
        rating_min: options.ratingMin || 0,
        price_range: options.priceRange || null
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get cuisine recommendations: ${error.message}`);
    }
  }

  // Get trending restaurants
  async getTrendingRestaurants(limit = 10, location = null) {
    try {
      const response = await this.client.get('/trending-restaurants', {
        params: {
          limit,
          location
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get trending restaurants: ${error.message}`);
    }
  }

  // Get recommendations for a group of users
  async getGroupRecommendations(userIds, options = {}) {
    try {
      const response = await this.client.get('/group-recommendations', {
        user_ids: userIds,
        limit: options.limit || 5
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get group recommendations: ${error.message}`);
    }
  }

  // Get health check
  async healthCheck() {
    try {
     
      const response = await this.client.get('/'); 
      return response.data;
    } catch (error) {
      throw new Error(`ML Service is unavailable: ${error.message}`);
    }
  }
}

module.exports = MLService;