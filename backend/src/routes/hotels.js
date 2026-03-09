import express from 'express';
import { authenticate, authorize, hotelStaffOrAdmin, asyncHandler } from '../auth/middleware.js';
import { validate } from '../auth/middleware.js';
import { hotelSchemas, roomSchemas } from '../validation/schemas.js';
import { hotels, rooms } from '../database/models.js';

const router = express.Router();

// Hotels Routes

// Create new hotel (admin only)
router.post('/',
  authenticate,
  authorize(['admin']),
  validate(hotelSchemas.create),
  asyncHandler(async (req, res) => {
    try {
      const hotel = await hotels.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Hotel created successfully',
        data: hotel
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create hotel'
      });
    }
  })
);

// Get featured hotels (public endpoint)
router.get('/featured',
  asyncHandler(async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 3;
      
      const featured = await hotels.list({
        limit,
        orderBy: 'avg_rating',
        orderDir: 'DESC'
      });

      res.json({
        success: true,
        data: featured
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured hotels'
      });
    }
  })
);

// Get all hotels (public endpoint)
router.get('/',
  asyncHandler(async (req, res) => {
    try {
      const filters = {
        city: req.query.city,
        country: req.query.country,
        stars: req.query.stars ? parseInt(req.query.stars) : undefined,
        search: req.query.search
      };

      const hotelList = await hotels.list(filters);

      res.json({
        success: true,
        data: hotelList
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotels'
      });
    }
  })
);

// Get hotel by ID (public endpoint)
router.get('/:id',
  asyncHandler(async (req, res) => {
    try {
      const hotel = await hotels.findById(req.params.id);
      
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found'
        });
      }

      res.json({
        success: true,
        data: hotel
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotel'
      });
    }
  })
);

// Get hotel with detailed stats (authenticated)
router.get('/:id/details',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const hotel = await hotels.getWithStats(req.params.id);
      
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found'
        });
      }

      res.json({
        success: true,
        data: hotel
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotel details'
      });
    }
  })
);

// Update hotel (admin/manager of hotel)
router.put('/:id',
  authenticate,
  hotelStaffOrAdmin,
  validate(hotelSchemas.update),
  asyncHandler(async (req, res) => {
    try {
      // Check if user is admin or manager of this hotel
      if (req.user.role === 'manager') {
        // In a real implementation, you would check if the manager is assigned to this hotel
        // For now, we'll allow all managers to update all hotels
      }

      const hotel = await hotels.update(req.params.id, req.body);
      
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found'
        });
      }

      res.json({
        success: true,
        message: 'Hotel updated successfully',
        data: hotel
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update hotel'
      });
    }
  })
);

// Deactivate hotel (admin only)
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    try {
      const hotel = await hotels.update(req.params.id, { is_active: false });
      
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found'
        });
      }

      res.json({
        success: true,
        message: 'Hotel deactivated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate hotel'
      });
    }
  })
);

// Get hotel rooms
router.get('/:id/rooms',
  asyncHandler(async (req, res) => {
    try {
      const filters = {
        hotel_id: req.params.id,
        status: req.query.status,
        type: req.query.type,
        max_guests: req.query.max_guests ? parseInt(req.query.max_guests) : undefined,
        min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined
      };

      const roomList = await rooms.list(filters);

      res.json({
        success: true,
        data: roomList
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotel rooms'
      });
    }
  })
);

// Get hotel analytics (admin/manager only)
router.get('/:id/analytics',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { analytics } = await import('../database/models.js');
      
      const startDate = req.query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = req.query.end_date || new Date().toISOString().split('T')[0];

      const [occupancyRate, revenue, monthlyRevenue, channelPerformance] = await Promise.all([
        analytics.getOccupancyRate(req.params.id, startDate, endDate),
        analytics.getRevenue(req.params.id, startDate, endDate),
        analytics.getMonthlyRevenue(req.params.id, new Date().getFullYear()),
        analytics.getChannelPerformance(req.params.id, startDate, endDate)
      ]);

      res.json({
        success: true,
        data: {
          occupancy_rate: occupancyRate,
          revenue: revenue,
          monthly_revenue: monthlyRevenue,
          channel_performance: channelPerformance,
          period: { start_date: startDate, end_date: endDate }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotel analytics'
      });
    }
  })
);

// Rooms Routes

// Create new room (admin/manager only)
router.post('/rooms',
  authenticate,
  hotelStaffOrAdmin,
  validate(roomSchemas.create),
  asyncHandler(async (req, res) => {
    try {
      const room = await rooms.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create room'
      });
    }
  })
);

// Get room by ID (public endpoint)
router.get('/rooms/:id',
  asyncHandler(async (req, res) => {
    try {
      const room = await rooms.findById(req.params.id);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch room'
      });
    }
  })
);

// Update room (admin/manager only)
router.put('/rooms/:id',
  authenticate,
  hotelStaffOrAdmin,
  validate(roomSchemas.update),
  asyncHandler(async (req, res) => {
    try {
      const room = await rooms.update(req.params.id, req.body);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.json({
        success: true,
        message: 'Room updated successfully',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update room'
      });
    }
  })
);

// Update room status (admin/manager/staff)
router.put('/rooms/:id/status',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const room = await rooms.updateStatus(req.params.id, status);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.json({
        success: true,
        message: 'Room status updated successfully',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update room status'
      });
    }
  })
);

// Check room availability
router.get('/rooms/:id/availability',
  asyncHandler(async (req, res) => {
    try {
      const { check_in, check_out } = req.query;
      
      if (!check_in || !check_out) {
        return res.status(400).json({
          success: false,
          message: 'Check-in and check-out dates are required'
        });
      }

      const isAvailable = await rooms.checkAvailability(req.params.id, check_in, check_out);

      res.json({
        success: true,
        data: {
          room_id: req.params.id,
          check_in,
          check_out,
          available: isAvailable
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check room availability'
      });
    }
  })
);

// Find available rooms for dates
router.get('/rooms/search',
  asyncHandler(async (req, res) => {
    try {
      const { hotel_id, check_in, check_out, guests = 1 } = req.query;
      
      if (!hotel_id || !check_in || !check_out) {
        return res.status(400).json({
          success: false,
          message: 'Hotel ID, check-in, and check-out dates are required'
        });
      }

      const availableRooms = await rooms.findAvailable(hotel_id, check_in, check_out, parseInt(guests));

      res.json({
        success: true,
        data: availableRooms
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search available rooms'
      });
    }
  })
);

// Get room rates for date range
router.get('/rooms/:id/rates',
  asyncHandler(async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start and end dates are required'
        });
      }

      // Get room rates from database
      const { room_rates } = await import('../database/models.js');
      const rates = await room_rates.list({
        room_id: req.params.id,
        start_date: start_date,
        end_date: end_date
      });

      res.json({
        success: true,
        data: rates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch room rates'
      });
    }
  })
);

// Get room performance metrics (admin/manager only)
router.get('/rooms/:id/performance',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { analytics } = await import('../database/models.js');
      
      const startDate = req.query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = req.query.end_date || new Date().toISOString().split('T')[0];

      // Get room performance
      const roomPerformance = await analytics.getRoomPerformance(
        await (await rooms.findById(req.params.id)).hotel_id,
        startDate,
        endDate
      );

      // Filter for this specific room
      const roomData = roomPerformance.find(room => room.id === req.params.id);

      res.json({
        success: true,
        data: roomData || {
          id: req.params.id,
          total_bookings: 0,
          total_revenue: 0,
          avg_rate: 0,
          occupied_nights: 0,
          base_price: 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch room performance'
      });
    }
  })
);

// Room rates management (admin/manager only)
router.post('/rooms/:id/rates',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { rates } = req.body; // Array of { date, price, is_available, min_stay, max_stay }
      
      if (!Array.isArray(rates) || rates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Rates array is required'
        });
      }

      const { room_rates } = await import('../database/models.js');
      const createdRates = [];

      for (const rateData of rates) {
        const rate = await room_rates.create({
          room_id: req.params.id,
          ...rateData
        });
        createdRates.push(rate);
      }

      res.status(201).json({
        success: true,
        message: 'Room rates created successfully',
        data: createdRates
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create room rates'
      });
    }
  })
);

// Delete room (admin only)
router.delete('/rooms/:id',
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    try {
      const room = await rooms.findById(req.params.id);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Check if room has active bookings
      const { bookings } = await import('../database/models.js');
      const activeBookings = await bookings.list({
        room_id: req.params.id,
        status: ['confirmed', 'checked_in']
      });

      if (activeBookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete room with active bookings'
        });
      }

      // Mark room as out of order instead of deleting
      await rooms.updateStatus(req.params.id, 'out_of_order');

      res.json({
        success: true,
        message: 'Room marked as out of order'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete room'
      });
    }
  })
);

export default router;
