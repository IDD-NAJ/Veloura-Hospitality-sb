import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Foursquare Places API Service
 * Provides location data, place recommendations, and venue information
 * Documentation: https://developer.foursquare.com/docs/places-api-overview
 */

class FoursquareService {
  constructor() {
    this.apiKey = process.env.FOURSQUARE_API_KEY;
    this.baseUrl = process.env.FOURSQUARE_BASE_URL || 'https://api.foursquare.com/v3';

    if (!this.apiKey) {
      console.warn('⚠️  Foursquare API key not configured');
    }
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, params = {}, method = 'GET') {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: this.apiKey,
          Accept: 'application/json',
        },
      };

      if (method === 'GET') {
        config.params = params;
      } else {
        config.data = params;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Foursquare API error (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search for places near a location
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Places results
   */
  async searchPlaces({ ll, near, query, categories, radius = 1000, limit = 50, sort = 'RELEVANCE' }) {
    const params = {
      limit,
      sort,
    };

    // Location can be specified by lat/lng or by place name
    if (ll) {
      params.ll = ll; // Format: "latitude,longitude"
    } else if (near) {
      params.near = near; // e.g., "New York, NY"
    }

    if (query) {
      params.query = query;
    }

    if (categories) {
      params.categories = categories; // Comma-separated category IDs
    }

    if (radius) {
      params.radius = radius; // Radius in meters
    }

    return await this.request('/places/search', params);
  }

  /**
   * Get place details by Foursquare ID
   * @param {string} fsqId - Foursquare place ID
   * @returns {Promise<Object>} Place details
   */
  async getPlaceDetails(fsqId) {
    return await this.request(`/places/${fsqId}`);
  }

  /**
   * Get place photos
   * @param {string} fsqId - Foursquare place ID
   * @returns {Promise<Object>} Place photos
   */
  async getPlacePhotos(fsqId, { limit = 10, classifications = 'outdoor,food,indoor' } = {}) {
    return await this.request(`/places/${fsqId}/photos`, {
      limit,
      classifications,
    });
  }

  /**
   * Get place tips (user reviews/recommendations)
   * @param {string} fsqId - Foursquare place ID
   * @returns {Promise<Object>} Place tips
   */
  async getPlaceTips(fsqId, { limit = 10, sort = 'POPULAR' } = {}) {
    return await this.request(`/places/${fsqId}/tips`, {
      limit,
      sort,
    });
  }

  /**
   * Search for restaurants near a location
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Restaurant results
   */
  async searchRestaurants({ ll, near, query, radius = 1000, limit = 50, price, openNow }) {
    const params = {
      categories: '13065', // Restaurant category ID
      limit,
      radius,
    };

    if (ll) params.ll = ll;
    if (near) params.near = near;
    if (query) params.query = query;
    if (price) params.price = price; // 1,2,3,4
    if (openNow) params.open_now = true;

    return await this.request('/places/search', params);
  }

  /**
   * Search for attractions/sightseeing near a location
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Attraction results
   */
  async searchAttractions({ ll, near, query, radius = 5000, limit = 50 }) {
    const params = {
      categories: '16000,10000,12000', // Arts & Entertainment, Event, Landmarks
      limit,
      radius,
    };

    if (ll) params.ll = ll;
    if (near) params.near = near;
    if (query) params.query = query;

    return await this.request('/places/search', params);
  }

  /**
   * Get nearby hotels
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Hotel results
   */
  async searchNearbyHotels({ ll, near, radius = 2000, limit = 50 }) {
    const params = {
      categories: '19014', // Hotel category ID
      limit,
      radius,
    };

    if (ll) params.ll = ll;
    if (near) params.near = near;

    return await this.request('/places/search', params);
  }

  /**
   * Get autocomplete suggestions for places
   * @param {string} query - Search query
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Autocomplete suggestions
   */
  async autocomplete(query, { ll, radius = 100000, limit = 10 } = {}) {
    const params = {
      query,
      limit,
    };

    if (ll) {
      params.ll = ll;
      params.radius = radius;
    }

    return await this.request('/autocomplete', params);
  }

  /**
   * Get trending places in a location
   * @param {Object} params - Location parameters
   * @returns {Promise<Object>} Trending places
   */
  async getTrendingPlaces({ ll, near, radius = 2000, limit = 50 }) {
    const params = {
      limit,
      radius,
      sort: 'POPULARITY',
    };

    if (ll) params.ll = ll;
    if (near) params.near = near;

    return await this.request('/places/search', params);
  }

  /**
   * Get place categories
   * @returns {Promise<Object>} Available categories
   */
  async getCategories() {
    return await this.request('/categories');
  }

  /**
   * Geocode an address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Geocoding results
   */
  async geocode(address) {
    return await this.request('/geocode/forward', {
      address,
    });
  }

  /**
   * Reverse geocode coordinates to address
   * @param {string} ll - Latitude,longitude
   * @returns {Promise<Object>} Reverse geocoding results
   */
  async reverseGeocode(ll) {
    return await this.request('/geocode/reverse', {
      ll,
    });
  }

  /**
   * Get recommendations based on a place
   * @param {string} fsqId - Foursquare place ID
   * @returns {Promise<Object>} Similar places
   */
  async getSimilarPlaces(fsqId, { limit = 10 } = {}) {
    return await this.request(`/places/${fsqId}/similar`, {
      limit,
    });
  }

  /**
   * Search for coffee shops
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Coffee shop results
   */
  async searchCoffeeShops({ ll, near, radius = 1000, limit = 20, openNow }) {
    const params = {
      categories: '13035', // Coffee Shop category
      limit,
      radius,
    };

    if (ll) params.ll = ll;
    if (near) params.near = near;
    if (openNow) params.open_now = true;

    return await this.request('/places/search', params);
  }

  /**
   * Search for nightlife venues
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Nightlife results
   */
  async searchNightlife({ ll, near, radius = 2000, limit = 50, openNow }) {
    const params = {
      categories: '10032,13003', // Nightlife Spot, Bar
      limit,
      radius,
    };

    if (ll) params.ll = ll;
    if (near) params.near = near;
    if (openNow) params.open_now = true;

    return await this.request('/places/search', params);
  }
}

// Export singleton instance
export default new FoursquareService();
