import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Amadeus Travel API Service
 * Provides access to flight search, hotel search, destination content, and travel recommendations
 * Documentation: https://developers.amadeus.com/
 */

class AmadeusService {
  constructor() {
    this.apiKey = process.env.AMADEUS_API_KEY;
    this.apiSecret = process.env.AMADEUS_API_SECRET;
    this.baseUrl = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
    this.environment = process.env.AMADEUS_ENVIRONMENT || 'test';
    this.accessToken = null;
    this.tokenExpiry = null;

    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️  Amadeus API credentials not configured');
    }
  }

  /**
   * Get OAuth2 access token
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Amadeus authentication failed:', error.message);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, params = {}) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error(`Amadeus API error (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search for flights
   * @param {Object} params - Flight search parameters
   * @returns {Promise<Object>} Flight offers
   */
  async searchFlights({ origin, destination, departureDate, returnDate, adults = 1, travelClass = 'ECONOMY' }) {
    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      travelClass,
    };

    if (returnDate) {
      params.returnDate = returnDate;
    }

    return await this.request('/v2/shopping/flight-offers', params);
  }

  /**
   * Search for hotels by city
   * @param {Object} params - Hotel search parameters
   * @returns {Promise<Object>} Hotel offers
   */
  async searchHotelsByCity({ cityCode, checkInDate, checkOutDate, adults = 1, radius = 5, radiusUnit = 'KM' }) {
    // First, get hotel IDs in the city
    const hotelListResponse = await this.request('/v1/reference-data/locations/hotels/by-city', {
      cityCode,
      radius,
      radiusUnit,
    });

    if (!hotelListResponse.data || hotelListResponse.data.length === 0) {
      return { data: [] };
    }

    // Get hotel offers for the found hotels (limit to first 50)
    const hotelIds = hotelListResponse.data.slice(0, 50).map(h => h.hotelId).join(',');
    
    return await this.searchHotelOffers({
      hotelIds,
      checkInDate,
      checkOutDate,
      adults,
    });
  }

  /**
   * Search for hotel offers
   * @param {Object} params - Hotel offer search parameters
   * @returns {Promise<Object>} Hotel offers with pricing
   */
  async searchHotelOffers({ hotelIds, checkInDate, checkOutDate, adults = 1, roomQuantity = 1 }) {
    return await this.request('/v3/shopping/hotel-offers', {
      hotelIds,
      checkInDate,
      checkOutDate,
      adults,
      roomQuantity,
    });
  }

  /**
   * Get hotel details by ID
   * @param {string} hotelId - Amadeus hotel ID
   * @returns {Promise<Object>} Hotel details
   */
  async getHotelDetails(hotelId) {
    return await this.request(`/v1/reference-data/locations/hotels/by-hotels`, {
      hotelIds: hotelId,
    });
  }

  /**
   * Get points of interest (attractions) by location
   * @param {Object} params - POI search parameters
   * @returns {Promise<Object>} Points of interest
   */
  async getPointsOfInterest({ latitude, longitude, radius = 1, radiusUnit = 'KM', categories = [] }) {
    const params = {
      latitude,
      longitude,
      radius,
    };

    if (categories.length > 0) {
      params.categories = categories.join(',');
    }

    return await this.request('/v1/shopping/activities', params);
  }

  /**
   * Get destination content (city information)
   * @param {string} cityCode - IATA city code
   * @returns {Promise<Object>} City information
   */
  async getCityInformation(cityCode) {
    return await this.request('/v1/reference-data/locations/cities', {
      keyword: cityCode,
    });
  }

  /**
   * Get airport information
   * @param {string} airportCode - IATA airport code
   * @returns {Promise<Object>} Airport details
   */
  async getAirportInfo(airportCode) {
    return await this.request('/v1/reference-data/locations', {
      keyword: airportCode,
      subType: 'AIRPORT',
    });
  }

  /**
   * Get travel recommendations based on origin
   * @param {string} origin - Origin city code
   * @returns {Promise<Object>} Recommended destinations
   */
  async getTravelRecommendations(origin) {
    return await this.request('/v1/shopping/flight-destinations', {
      origin,
    });
  }

  /**
   * Get safe place information (COVID-19 travel restrictions)
   * @param {string} countryCode - ISO country code
   * @returns {Promise<Object>} Travel safety information
   */
  async getSafePlaceInfo(countryCode) {
    return await this.request('/v1/duty-of-care/diseases/covid19-area-report', {
      countryCode,
    });
  }

  /**
   * Search for car rentals
   * @param {Object} params - Car rental search parameters
   * @returns {Promise<Object>} Car rental offers
   */
  async searchCarRentals({ pickupLocationCode, dropoffLocationCode, pickupDate, dropoffDate }) {
    return await this.request('/v1/shopping/car-rentals', {
      pickupLocationCode,
      dropoffLocationCode,
      pickupDate,
      dropoffDate,
    });
  }

  /**
   * Get flight price analysis
   * @param {Object} params - Price analysis parameters
   * @returns {Promise<Object>} Price insights
   */
  async getFlightPriceAnalysis({ origin, destination, departureDate }) {
    return await this.request('/v1/analytics/itinerary-price-metrics', {
      originIataCode: origin,
      destinationIataCode: destination,
      departureDate,
    });
  }
}

// Export singleton instance
export default new AmadeusService();
