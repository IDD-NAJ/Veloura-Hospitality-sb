import express from 'express';
import foursquareService from '../services/foursquareService.js';

const router = express.Router();

/**
 * @route   GET /api/foursquare/places/search
 * @desc    Search for places
 * @access  Public
 */
router.get('/places/search', async (req, res) => {
  try {
    const { ll, near, query, categories, radius, limit, sort } = req.query;

    if (!ll && !near) {
      return res.status(400).json({
        success: false,
        message: 'Either ll (latitude,longitude) or near (location name) is required',
      });
    }

    const results = await foursquareService.searchPlaces({
      ll,
      near,
      query,
      categories,
      radius: radius ? parseInt(radius) : 1000,
      limit: limit ? parseInt(limit) : 50,
      sort,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Place search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search places',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/places/:fsqId
 * @desc    Get place details
 * @access  Public
 */
router.get('/places/:fsqId', async (req, res) => {
  try {
    const { fsqId } = req.params;

    const results = await foursquareService.getPlaceDetails(fsqId);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get place details',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/places/:fsqId/photos
 * @desc    Get place photos
 * @access  Public
 */
router.get('/places/:fsqId/photos', async (req, res) => {
  try {
    const { fsqId } = req.params;
    const { limit, classifications } = req.query;

    const results = await foursquareService.getPlacePhotos(fsqId, {
      limit: limit ? parseInt(limit) : 10,
      classifications,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Place photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get place photos',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/places/:fsqId/tips
 * @desc    Get place tips/reviews
 * @access  Public
 */
router.get('/places/:fsqId/tips', async (req, res) => {
  try {
    const { fsqId } = req.params;
    const { limit, sort } = req.query;

    const results = await foursquareService.getPlaceTips(fsqId, {
      limit: limit ? parseInt(limit) : 10,
      sort,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Place tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get place tips',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/restaurants
 * @desc    Search for restaurants
 * @access  Public
 */
router.get('/restaurants', async (req, res) => {
  try {
    const { ll, near, query, radius, limit, price, openNow } = req.query;

    if (!ll && !near) {
      return res.status(400).json({
        success: false,
        message: 'Either ll or near is required',
      });
    }

    const results = await foursquareService.searchRestaurants({
      ll,
      near,
      query,
      radius: radius ? parseInt(radius) : 1000,
      limit: limit ? parseInt(limit) : 50,
      price,
      openNow: openNow === 'true',
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Restaurant search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search restaurants',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/attractions
 * @desc    Search for attractions
 * @access  Public
 */
router.get('/attractions', async (req, res) => {
  try {
    const { ll, near, query, radius, limit } = req.query;

    if (!ll && !near) {
      return res.status(400).json({
        success: false,
        message: 'Either ll or near is required',
      });
    }

    const results = await foursquareService.searchAttractions({
      ll,
      near,
      query,
      radius: radius ? parseInt(radius) : 5000,
      limit: limit ? parseInt(limit) : 50,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Attraction search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search attractions',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/autocomplete
 * @desc    Get autocomplete suggestions
 * @access  Public
 */
router.get('/autocomplete', async (req, res) => {
  try {
    const { query, ll, radius, limit } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required',
      });
    }

    const results = await foursquareService.autocomplete(query, {
      ll,
      radius: radius ? parseInt(radius) : 100000,
      limit: limit ? parseInt(limit) : 10,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get autocomplete suggestions',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/trending
 * @desc    Get trending places
 * @access  Public
 */
router.get('/trending', async (req, res) => {
  try {
    const { ll, near, radius, limit } = req.query;

    if (!ll && !near) {
      return res.status(400).json({
        success: false,
        message: 'Either ll or near is required',
      });
    }

    const results = await foursquareService.getTrendingPlaces({
      ll,
      near,
      radius: radius ? parseInt(radius) : 2000,
      limit: limit ? parseInt(limit) : 50,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Trending places error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending places',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/categories
 * @desc    Get available categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const results = await foursquareService.getCategories();

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/geocode
 * @desc    Geocode an address
 * @access  Public
 */
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address parameter is required',
      });
    }

    const results = await foursquareService.geocode(address);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to geocode address',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/foursquare/reverse-geocode
 * @desc    Reverse geocode coordinates
 * @access  Public
 */
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { ll } = req.query;

    if (!ll) {
      return res.status(400).json({
        success: false,
        message: 'll (latitude,longitude) parameter is required',
      });
    }

    const results = await foursquareService.reverseGeocode(ll);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode',
      error: error.message,
    });
  }
});

export default router;
