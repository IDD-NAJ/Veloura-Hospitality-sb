import axios from 'axios';

// Google Maps Service
// Mirrors the GoogleMapsService from hotel-backend.jsx

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  // Generate embed URL for a map
  embedUrl(address, zoom = 15) {
    return `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=${encodeURIComponent(address)}&zoom=${zoom}&maptype=roadmap`;
  }

  // Generate directions embed URL
  directionsUrl(origin, destination, mode = 'driving') {
    return `https://www.google.com/maps/embed/v1/directions?key=${this.apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}`;
  }

  // Geocode an address to lat/lng
  async geocode(address) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: { address, key: this.apiKey }
      });

      const result = response.data.results?.[0];
      if (!result) throw new Error('Geocode failed: No results found');

      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } catch (error) {
      console.error('Geocode failed:', error.message);
      throw new Error(`Geocode failed: ${error.message}`);
    }
  }

  // Reverse geocode lat/lng to address
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: { latlng: `${lat},${lng}`, key: this.apiKey }
      });

      return response.data.results?.[0]?.formatted_address || '';
    } catch (error) {
      console.error('Reverse geocode failed:', error.message);
      throw new Error(`Reverse geocode failed: ${error.message}`);
    }
  }

  // Find nearby places
  async getNearby(lat, lng, type = 'restaurant', radius = 1000) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius,
          type,
          key: this.apiKey
        }
      });

      return (response.data.results || []).map(place => ({
        name: place.name,
        address: place.vicinity,
        rating: place.rating,
        totalRatings: place.user_ratings_total,
        placeId: place.place_id,
        types: place.types,
        location: place.geometry?.location,
        openNow: place.opening_hours?.open_now,
        priceLevel: place.price_level,
        photos: place.photos?.map(p => 
          `${this.baseUrl}/place/photo?maxwidth=400&photo_reference=${p.photo_reference}&key=${this.apiKey}`
        ) || []
      }));
    } catch (error) {
      console.error('Nearby search failed:', error.message);
      throw new Error(`Nearby search failed: ${error.message}`);
    }
  }

  // Get place details
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,rating,reviews,opening_hours,photos,geometry',
          key: this.apiKey
        }
      });

      return response.data.result;
    } catch (error) {
      console.error('Place details failed:', error.message);
      throw new Error(`Place details failed: ${error.message}`);
    }
  }

  // Calculate distance between two points
  async getDistance(origin, destination, mode = 'driving') {
    try {
      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: origin,
          destinations: destination,
          mode,
          key: this.apiKey
        }
      });

      const element = response.data.rows?.[0]?.elements?.[0];
      if (!element || element.status !== 'OK') {
        throw new Error('Distance calculation failed');
      }

      return {
        distance: element.distance,
        duration: element.duration,
        status: element.status
      };
    } catch (error) {
      console.error('Distance calculation failed:', error.message);
      throw new Error(`Distance calculation failed: ${error.message}`);
    }
  }
}

export const googleMapsService = new GoogleMapsService();
export default GoogleMapsService;
