import express from 'express';
import { authenticate, authorize, hotelStaffOrAdmin, asyncHandler } from '../auth/middleware.js';
import { analytics } from '../database/models.js';

const router = express.Router();

// Revenue analytics
router.get('/revenue',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const { hotel_id, start_date, end_date, year } = req.query;

    if (!hotel_id) {
      return res.status(400).json({ success: false, message: 'Hotel ID is required' });
    }

    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const [revenue, monthlyRevenue] = await Promise.all([
      analytics.getRevenue(hotel_id, startDate, endDate),
      analytics.getMonthlyRevenue(hotel_id, year || new Date().getFullYear())
    ]);

    res.json({
      success: true,
      data: {
        total_revenue: revenue,
        monthly_breakdown: monthlyRevenue,
        period: { start_date: startDate, end_date: endDate }
      }
    });
  })
);

// Occupancy analytics
router.get('/occupancy',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const { hotel_id, start_date, end_date } = req.query;

    if (!hotel_id) {
      return res.status(400).json({ success: false, message: 'Hotel ID is required' });
    }

    const startDate = start_date || new Date().toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const occupancyRate = await analytics.getOccupancyRate(hotel_id, startDate, endDate);

    res.json({
      success: true,
      data: {
        occupancy_rate: occupancyRate,
        period: { start_date: startDate, end_date: endDate }
      }
    });
  })
);

// Channel performance
router.get('/channels',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const { hotel_id, start_date, end_date } = req.query;

    if (!hotel_id) {
      return res.status(400).json({ success: false, message: 'Hotel ID is required' });
    }

    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const channelPerformance = await analytics.getChannelPerformance(hotel_id, startDate, endDate);

    res.json({
      success: true,
      data: channelPerformance
    });
  })
);

// Guest demographics
router.get('/demographics',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const { hotel_id, start_date, end_date } = req.query;

    if (!hotel_id) {
      return res.status(400).json({ success: false, message: 'Hotel ID is required' });
    }

    const startDate = start_date || new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const demographics = await analytics.getGuestDemographics(hotel_id, startDate, endDate);

    res.json({
      success: true,
      data: demographics
    });
  })
);

// Room performance
router.get('/rooms',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const { hotel_id, start_date, end_date } = req.query;

    if (!hotel_id) {
      return res.status(400).json({ success: false, message: 'Hotel ID is required' });
    }

    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const roomPerformance = await analytics.getRoomPerformance(hotel_id, startDate, endDate);

    res.json({
      success: true,
      data: roomPerformance
    });
  })
);

// Dashboard stats (combined overview)
router.get('/dashboard',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const { hotel_id } = req.query;

    if (!hotel_id) {
      return res.status(400).json({ success: false, message: 'Hotel ID is required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0];

    const [
      currentOccupancy,
      currentRevenue,
      prevRevenue,
      channelPerformance,
      monthlyRevenue
    ] = await Promise.all([
      analytics.getOccupancyRate(hotel_id, today, today),
      analytics.getRevenue(hotel_id, thirtyDaysAgo, today),
      analytics.getRevenue(hotel_id, sixtyDaysAgo, thirtyDaysAgo),
      analytics.getChannelPerformance(hotel_id, thirtyDaysAgo, today),
      analytics.getMonthlyRevenue(hotel_id, new Date().getFullYear())
    ]);

    // Calculate revenue change
    const revenueChange = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : 0;

    // Calculate ADR (Average Daily Rate)
    const totalBookings = channelPerformance.reduce((sum, ch) => sum + parseInt(ch.bookings || 0), 0);
    const adr = totalBookings > 0 ? (currentRevenue / totalBookings).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        occupancy_rate: currentOccupancy,
        revenue: {
          current: currentRevenue,
          previous: prevRevenue,
          change: parseFloat(revenueChange),
          direction: currentRevenue >= prevRevenue ? 'up' : 'down'
        },
        adr: parseFloat(adr),
        total_bookings: totalBookings,
        channel_performance: channelPerformance,
        monthly_revenue: monthlyRevenue
      }
    });
  })
);

// Generate report (PDF/Excel)
router.post('/reports/generate',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const { hotel_id, type, start_date, end_date, format = 'pdf' } = req.body;

    if (!hotel_id || !type) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID and report type are required'
      });
    }

    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    // Gather data based on report type
    let reportData = {};

    switch (type) {
      case 'revenue':
        reportData = {
          revenue: await analytics.getRevenue(hotel_id, startDate, endDate),
          monthly: await analytics.getMonthlyRevenue(hotel_id, new Date().getFullYear()),
          channels: await analytics.getChannelPerformance(hotel_id, startDate, endDate)
        };
        break;
      case 'occupancy':
        reportData = {
          rate: await analytics.getOccupancyRate(hotel_id, startDate, endDate),
          rooms: await analytics.getRoomPerformance(hotel_id, startDate, endDate)
        };
        break;
      case 'guest_satisfaction':
        reportData = {
          demographics: await analytics.getGuestDemographics(hotel_id, startDate, endDate)
        };
        break;
      case 'channel_performance':
        reportData = {
          channels: await analytics.getChannelPerformance(hotel_id, startDate, endDate)
        };
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    // In production, generate a PDF/Excel file here
    // For now, return the data as JSON
    const { sql } = await import('../database/connection.js');
    const report = await sql`
      INSERT INTO reports (hotel_id, type, title, description, parameters, format, generated_by)
      VALUES (
        ${hotel_id}, ${type}, 
        ${`${type.charAt(0).toUpperCase() + type.slice(1)} Report`},
        ${`Report for ${startDate} to ${endDate}`},
        ${JSON.stringify({ start_date: startDate, end_date: endDate })},
        ${format}, ${req.user.id}
      )
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        report: report[0],
        reportData
      }
    });
  })
);

// List generated reports
router.get('/reports',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const { hotel_id } = req.query;
    const { sql } = await import('../database/connection.js');

    let query = sql`
      SELECT r.*, u.name as generated_by_name
      FROM reports r
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE 1=1
    `;

    if (hotel_id) {
      query = sql`${query} AND r.hotel_id = ${hotel_id}`;
    }

    query = sql`${query} ORDER BY r.generated_at DESC LIMIT 50`;

    const reports = await query;

    res.json({
      success: true,
      data: reports
    });
  })
);

export default router;
