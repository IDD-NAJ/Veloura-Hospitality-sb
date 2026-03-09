import express from 'express';
import { authenticate, authorize, hotelStaffOrAdmin, asyncHandler, optionalAuth } from '../auth/middleware.js';
import { validate } from '../auth/middleware.js';
import { reviewSchemas } from '../validation/schemas.js';
import { reviews, bookings } from '../database/models.js';

const router = express.Router();

// Get reviews for a hotel (public)
router.get('/hotel/:hotelId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const publicOnly = !req.user || !['admin', 'manager'].includes(req.user.role);
    const reviewList = await reviews.listByHotel(req.params.hotelId, publicOnly);

    res.json({
      success: true,
      data: reviewList
    });
  })
);

// Get average rating for a hotel (public)
router.get('/hotel/:hotelId/rating',
  asyncHandler(async (req, res) => {
    const avgRating = await reviews.getAverageRating(req.params.hotelId);

    res.json({
      success: true,
      data: avgRating
    });
  })
);

// Get a single review
router.get('/:id',
  asyncHandler(async (req, res) => {
    const review = await reviews.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  })
);

// Create a review (authenticated guests only)
router.post('/',
  authenticate,
  validate(reviewSchemas.create),
  asyncHandler(async (req, res) => {
    const { booking_id } = req.body;

    // Verify booking exists and belongs to user
    const booking = await bookings.findById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user_id !== req.user.id && req.user.role === 'guest') {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    // Must be checked out to review
    if (booking.status !== 'checked_out') {
      return res.status(400).json({
        success: false,
        message: 'You can only review after checking out'
      });
    }

    const review = await reviews.create({
      ...req.body,
      user_id: req.user.id,
      hotel_id: booking.hotel_id
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  })
);

// Respond to a review (manager/admin only)
router.post('/:id/respond',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const { response_text } = req.body;

    if (!response_text || response_text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const review = await reviews.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const updated = await reviews.respond(req.params.id, response_text, req.user.id);

    res.json({
      success: true,
      message: 'Response posted successfully',
      data: updated
    });
  })
);

// Toggle review visibility (admin only)
router.patch('/:id/visibility',
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { is_public } = req.body;
    const { sql } = await import('../database/connection.js');

    const result = await sql`
      UPDATE reviews SET is_public = ${is_public}, updated_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (!result[0]) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: `Review ${is_public ? 'published' : 'hidden'}`,
      data: result[0]
    });
  })
);

export default router;
