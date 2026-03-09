import express from 'express';
import { authService } from '../auth/authService.js';
import { authenticate, authorize, selfOnlyOrAuthorized, authRateLimit, asyncHandler } from '../auth/middleware.js';
import { validate } from '../auth/middleware.js';
import { userSchemas } from '../validation/schemas.js';
import { users } from '../database/models.js';

const router = express.Router();

// Register new user
router.post('/register', 
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  validate(userSchemas.register),
  asyncHandler(async (req, res) => {
    const { email, password, name, phone, nationality } = req.body;
    
    try {
      const result = await authService.register({
        email,
        password,
        name,
        phone,
        nationality
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  })
);

// User login
router.post('/login',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  validate(userSchemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Refresh access token
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    try {
      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Logout
router.post('/logout',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    try {
      await authService.logout(refreshToken);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Request password reset
router.post('/request-password-reset',
  authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    try {
      const result = await authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: result.message,
        ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken })
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Reset password
router.post('/reset-password',
  validate(userSchemas.resetPassword),
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    
    try {
      const result = await authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Verify email
router.post('/verify-email',
  asyncHandler(async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    try {
      const result = await authService.verifyEmail(token);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Get current user profile (authenticated)
router.get('/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const user = await authService.getProfile(req.user.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Update current user profile (authenticated)
router.put('/profile',
  authenticate,
  validate(userSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Change password (authenticated)
router.put('/change-password',
  authenticate,
  validate(userSchemas.changePassword),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    try {
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  })
);

// Get user by ID (admin/manager only)
router.get('/:id',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    try {
      const user = await users.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive data
      delete user.password_hash;

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  })
);

// Update user (admin/manager only)
router.put('/:id',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    try {
      const user = await users.update(req.params.id, req.body);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive data
      delete user.password_hash;

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user'
      });
    }
  })
);

// List users (admin/manager only)
router.get('/',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    try {
      const filters = {
        role: req.query.role,
        loyalty_tier: req.query.loyalty_tier,
        search: req.query.search,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      const userList = await users.list(filters);

      res.json({
        success: true,
        data: userList
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  })
);

// Deactivate user (admin only)
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    try {
      const user = await users.softDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate user'
      });
    }
  })
);

// Update user loyalty stats (admin only)
router.post('/:id/update-loyalty',
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    try {
      await users.updateLoyaltyStats(req.params.id);

      res.json({
        success: true,
        message: 'Loyalty stats updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update loyalty stats'
      });
    }
  })
);

// Get user booking history (authenticated user or admin/manager)
router.get('/:id/bookings',
  authenticate,
  selfOnlyOrAuthorized(['admin', 'manager'], 'id'),
  asyncHandler(async (req, res) => {
    try {
      const { bookings } = await import('../database/models.js');
      
      const userBookings = await bookings.list({
        user_id: req.params.id,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      });

      res.json({
        success: true,
        data: userBookings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user bookings'
      });
    }
  })
);

// Get user payment history (authenticated user or admin/manager)
router.get('/:id/payments',
  authenticate,
  selfOnlyOrAuthorized(['admin', 'manager'], 'id'),
  asyncHandler(async (req, res) => {
    try {
      const { payments } = await import('../database/models.js');
      
      // Get user's bookings first
      const userBookings = await bookings.list({ user_id: req.params.id });
      const bookingIds = userBookings.map(booking => booking.id);
      
      if (bookingIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Get payments for these bookings
      const userPayments = [];
      for (const bookingId of bookingIds) {
        const bookingPayments = await payments.listByBooking(bookingId);
        userPayments.push(...bookingPayments);
      }

      res.json({
        success: true,
        data: userPayments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user payments'
      });
    }
  })
);

export default router;
