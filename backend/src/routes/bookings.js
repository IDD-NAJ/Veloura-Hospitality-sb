import express from 'express';
import { authenticate, authorize, hotelStaffOrAdmin, asyncHandler, optionalAuth } from '../auth/middleware.js';
import { validate } from '../auth/middleware.js';
import { bookingSchemas } from '../validation/schemas.js';
import { bookings, rooms, users } from '../database/models.js';

const router = express.Router();

// Create new booking
router.post('/',
  authenticate,
  validate(bookingSchemas.create),
  asyncHandler(async (req, res) => {
    const { room_id, check_in, check_out } = req.body;

    // Check room availability
    const isAvailable = await rooms.checkAvailability(room_id, check_in, check_out);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Create booking
    const booking = await bookings.create(req.body);

    // Update room status to occupied if check-in is today
    const today = new Date().toISOString().split('T')[0];
    if (check_in === today) {
      await rooms.updateStatus(room_id, 'occupied');
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  })
);

// List bookings with filters
router.get('/',
  authenticate,
  asyncHandler(async (req, res) => {
    const filters = {
      hotel_id: req.query.hotel_id,
      status: req.query.status,
      payment_status: req.query.payment_status,
      check_in_from: req.query.check_in_from,
      check_in_to: req.query.check_in_to,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    // Guests can only see their own bookings
    if (req.user.role === 'guest') {
      filters.user_id = req.user.id;
    } else if (req.query.user_id) {
      filters.user_id = req.query.user_id;
    }

    const bookingList = await bookings.list(filters);

    res.json({
      success: true,
      data: bookingList
    });
  })
);

// Get booking by ID
router.get('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const booking = await bookings.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Guests can only see their own bookings
    if (req.user.role === 'guest' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own bookings'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  })
);

// Get booking by reference number (public lookup)
router.get('/ref/:ref',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const booking = await bookings.findByRef(req.params.ref);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If not authenticated, return limited info
    if (!req.user) {
      return res.json({
        success: true,
        data: {
          ref: booking.ref,
          status: booking.status,
          check_in: booking.check_in,
          check_out: booking.check_out,
          hotel_name: booking.hotel_name,
          room_name: booking.room_name
        }
      });
    }

    res.json({
      success: true,
      data: booking
    });
  })
);

// Update booking
router.put('/:id',
  authenticate,
  validate(bookingSchemas.update),
  asyncHandler(async (req, res) => {
    const existing = await bookings.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Guests can only update their own bookings (limited fields)
    if (req.user.role === 'guest') {
      if (existing.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own bookings'
        });
      }
      // Guests can only update notes and special_requests
      const allowedFields = ['notes', 'special_requests'];
      const filteredUpdates = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          filteredUpdates[field] = req.body[field];
        }
      }
      req.body = filteredUpdates;
    }

    const booking = await bookings.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  })
);

// Check-in guest
router.post('/:id/checkin',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const booking = await bookings.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in a booking with status: ${booking.status}`
      });
    }

    const updated = await bookings.checkIn(req.params.id);

    res.json({
      success: true,
      message: 'Guest checked in successfully',
      data: updated
    });
  })
);

// Check-out guest
router.post('/:id/checkout',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const booking = await bookings.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out a booking with status: ${booking.status}`
      });
    }

    const updated = await bookings.checkOut(req.params.id);

    res.json({
      success: true,
      message: 'Guest checked out successfully',
      data: updated
    });
  })
);

// Cancel booking
router.post('/:id/cancel',
  authenticate,
  validate(bookingSchemas.cancel),
  asyncHandler(async (req, res) => {
    const booking = await bookings.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Guests can only cancel their own bookings
    if (req.user.role === 'guest' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }

    if (['checked_out', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status: ${booking.status}`
      });
    }

    const updated = await bookings.cancel(
      req.params.id,
      req.body.reason,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updated
    });
  })
);

// Mark booking as no-show (staff/admin only)
router.post('/:id/no-show',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const booking = await bookings.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot mark as no-show a booking with status: ${booking.status}`
      });
    }

    const updated = await bookings.update(req.params.id, { status: 'no_show' });
    await rooms.updateStatus(booking.room_id, 'available');

    res.json({
      success: true,
      message: 'Booking marked as no-show',
      data: updated
    });
  })
);

// Get today's arrivals
router.get('/today/arrivals',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const arrivals = await bookings.list({
      check_in_from: today,
      check_in_to: today,
      hotel_id: req.query.hotel_id,
      status: 'confirmed'
    });

    res.json({
      success: true,
      data: arrivals
    });
  })
);

// Get today's departures
router.get('/today/departures',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const departures = await bookings.list({
      check_in_to: today, // check_out = today
      hotel_id: req.query.hotel_id,
      status: 'checked_in'
    });

    res.json({
      success: true,
      data: departures
    });
  })
);

export default router;
