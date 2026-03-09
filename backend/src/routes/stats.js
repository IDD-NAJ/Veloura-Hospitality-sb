import express from 'express';
import { asyncHandler } from '../auth/middleware.js';
import { sql } from '../database/connection.js';

const router = express.Router();

/**
 * @route   GET /api/stats/summary
 * @desc    Get site-wide statistics for homepage trust counters
 * @access  Public
 */
router.get('/summary', asyncHandler(async (req, res) => {
  try {
    // Query hotel stats (always available)
    let totalHotels = 0, totalCountries = 0, avgRating = 0;
    try {
      const hotelStats = await sql`
        SELECT 
          COUNT(*) as total_hotels,
          COUNT(DISTINCT country) as total_countries
        FROM hotels WHERE is_active = true
      `;
      totalHotels = parseInt(hotelStats[0].total_hotels) || 0;
      totalCountries = parseInt(hotelStats[0].total_countries) || 0;
    } catch (e) {
      console.error('Stats: hotels query failed:', e.message);
    }

    // Query average rating from reviews (table may not exist)
    try {
      const ratingStats = await sql`
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as avg_rating
        FROM reviews WHERE is_public = true
      `;
      avgRating = parseFloat(ratingStats[0].avg_rating) || 0;
    } catch (e) {
      // reviews table may not exist yet
    }

    // Query bookings count (table may not exist)
    let totalBookings = 0;
    try {
      const bookingStats = await sql`SELECT COUNT(*) as cnt FROM bookings`;
      totalBookings = parseInt(bookingStats[0].cnt) || 0;
    } catch (e) {
      // bookings table may not exist yet
    }

    // Query guest count (table may not exist)
    let totalGuests = 0;
    try {
      const guestStats = await sql`SELECT COUNT(*) as cnt FROM users WHERE role = 'guest'`;
      totalGuests = parseInt(guestStats[0].cnt) || 0;
    } catch (e) {
      // users table may not exist yet
    }

    res.json({
      success: true,
      data: {
        totalHotels,
        totalCountries,
        avgRating: avgRating || 4.9,
        totalBookings,
        totalGuests,
        support: '24/7'
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
}));

/**
 * @route   GET /api/stats/destinations
 * @desc    Get popular destinations derived from hotels
 * @access  Public
 */
router.get('/destinations', asyncHandler(async (req, res) => {
  try {
    const destinations = await sql`
      SELECT 
        city,
        country,
        COUNT(*) as hotel_count,
        MIN(latitude) as lat,
        MIN(longitude) as lng
      FROM hotels 
      WHERE is_active = true
      GROUP BY city, country
      ORDER BY hotel_count DESC
      LIMIT 6
    `;

    res.json({
      success: true,
      data: destinations.map(d => ({
        name: d.city,
        country: d.country,
        hotels: parseInt(d.hotel_count),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lng)
      }))
    });
  } catch (error) {
    console.error('Destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destinations'
    });
  }
}));

export default router;
