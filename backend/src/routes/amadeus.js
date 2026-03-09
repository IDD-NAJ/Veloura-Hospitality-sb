import express from 'express';
import amadeusService from '../services/amadeusService.js';

const router = express.Router();

/**
 * @route   GET /api/amadeus/flights/search
 * @desc    Search for flights
 * @access  Public
 */
router.get('/flights/search', async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults, travelClass } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: origin, destination, departureDate',
      });
    }

    const results = await amadeusService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: adults ? parseInt(adults) : 1,
      travelClass: travelClass || 'ECONOMY',
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search flights',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/amadeus/hotels/search
 * @desc    Search for hotels by city
 * @access  Public
 */
router.get('/hotels/search', async (req, res) => {
  try {
    const { cityCode, checkInDate, checkOutDate, adults, radius } = req.query;

    if (!cityCode || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: cityCode, checkInDate, checkOutDate',
      });
    }

    const results = await amadeusService.searchHotelsByCity({
      cityCode,
      checkInDate,
      checkOutDate,
      adults: adults ? parseInt(adults) : 1,
      radius: radius ? parseInt(radius) : 5,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Hotel search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search hotels',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/amadeus/hotels/:hotelId
 * @desc    Get hotel details
 * @access  Public
 */
router.get('/hotels/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;

    const results = await amadeusService.getHotelDetails(hotelId);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Hotel details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hotel details',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/amadeus/attractions
 * @desc    Get points of interest (attractions)
 * @access  Public
 */
router.get('/attractions', async (req, res) => {
  try {
    const { latitude, longitude, radius, categories } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: latitude, longitude',
      });
    }

    const results = await amadeusService.getPointsOfInterest({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: radius ? parseInt(radius) : 1,
      categories: categories ? categories.split(',') : [],
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Attractions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attractions',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/amadeus/destinations/recommendations
 * @desc    Get travel recommendations
 * @access  Public
 */
router.get('/destinations/recommendations', async (req, res) => {
  try {
    const { origin } = req.query;

    if (!origin) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: origin',
      });
    }

    const results = await amadeusService.getTravelRecommendations(origin);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/amadeus/cities/:cityCode
 * @desc    Get city information
 * @access  Public
 */
router.get('/cities/:cityCode', async (req, res) => {
  try {
    const { cityCode } = req.params;

    const results = await amadeusService.getCityInformation(cityCode);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('City info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get city information',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/amadeus/airports/:airportCode
 * @desc    Get airport information
 * @access  Public
 */
router.get('/airports/:airportCode', async (req, res) => {
  try {
    const { airportCode } = req.params;

    const results = await amadeusService.getAirportInfo(airportCode);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Airport info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get airport information',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/amadeus/safety/:countryCode
 * @desc    Get travel safety information
 * @access  Public
 */
router.get('/safety/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;

    const results = await amadeusService.getSafePlaceInfo(countryCode);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Safety info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get safety information',
      error: error.message,
    });
  }
});

export default router;
