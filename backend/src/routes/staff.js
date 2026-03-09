import express from 'express';
import { authenticate, authorize, asyncHandler } from '../auth/middleware.js';
import { validate } from '../auth/middleware.js';
import { staffSchemas } from '../validation/schemas.js';
import { users, staff } from '../database/models.js';

const router = express.Router();

// Create staff member (admin/manager only)
router.post('/',
  authenticate,
  authorize(['admin', 'manager']),
  validate(staffSchemas.create),
  asyncHandler(async (req, res) => {
    try {
      // Check if user exists
      const user = await users.findById(req.body.user_id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is already staff
      const existingStaff = await staff.findByUserId(req.body.user_id);
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'User is already a staff member'
        });
      }

      // Update user role to staff if not already
      if (user.role === 'guest') {
        await users.update(req.body.user_id, { role: 'staff' });
      }

      // Create staff record
      const staffMember = await staff.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: staffMember
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create staff member'
      });
    }
  })
);

// Get staff member by ID (admin/manager or self)
router.get('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const staffMember = await staff.findById(req.params.id);
      
      if (!staffMember) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Check permissions: admin/manager can see all, staff can only see themselves
      if (req.user.role === 'guest') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      if (req.user.role === 'staff' && req.user.id !== staffMember.user_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own staff profile'
        });
      }

      // Get user details
      const user = await users.findById(staffMember.user_id);
      
      res.json({
        success: true,
        data: {
          ...staffMember,
          user: {
            name: user.name,
            email: user.email,
            phone: user.phone
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch staff member'
      });
    }
  })
);

// Update staff member (admin/manager or self for limited fields)
router.put('/:id',
  authenticate,
  validate(staffSchemas.update),
  asyncHandler(async (req, res) => {
    try {
      const existingStaff = await staff.findById(req.params.id);
      
      if (!existingStaff) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Check permissions
      if (req.user.role === 'guest') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Staff can only update certain fields
      let allowedUpdates = req.body;
      if (req.user.role === 'staff') {
        if (req.user.id !== existingStaff.user_id) {
          return res.status(403).json({
            success: false,
            message: 'You can only update your own staff profile'
          });
        }
        
        // Staff can only update limited fields
        const staffAllowedFields = ['emergency_contact_name', 'emergency_contact_phone'];
        allowedUpdates = {};
        for (const field of staffAllowedFields) {
          if (req.body[field] !== undefined) {
            allowedUpdates[field] = req.body[field];
          }
        }
      }

      const updatedStaff = await staff.update(req.params.id, allowedUpdates);

      res.json({
        success: true,
        message: 'Staff member updated successfully',
        data: updatedStaff
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update staff member'
      });
    }
  })
);

// List staff members (admin/manager only)
router.get('/',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    try {
      const filters = {
        hotel_id: req.query.hotel_id,
        department: req.query.department,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
      };

      const staffList = await staff.list(filters);

      // Get user details for each staff member
      const staffWithUsers = await Promise.all(
        staffList.map(async (staffMember) => {
          const user = await users.findById(staffMember.user_id);
          return {
            ...staffMember,
            user: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              avatar_url: user.avatar_url
            }
          };
        })
      );

      res.json({
        success: true,
        data: staffWithUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch staff members'
      });
    }
  })
);

// Delete staff member (admin only)
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    try {
      const staffMember = await staff.findById(req.params.id);
      
      if (!staffMember) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Update staff status to inactive
      const updatedStaff = await staff.update(req.params.id, { 
        is_active: false,
        termination_date: new Date().toISOString().split('T')[0],
        termination_reason: 'Terminated by admin'
      });

      // Update user role back to guest
      await users.update(staffMember.user_id, { role: 'guest' });

      res.json({
        success: true,
        message: 'Staff member terminated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to terminate staff member'
      });
    }
  })
);

// Get staff by hotel ID (admin/manager/staff of same hotel)
router.get('/hotel/:hotelId',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const hotelId = req.params.hotelId;

      // Check permissions
      if (req.user.role === 'guest') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Staff can only see staff from their own hotel
      if (req.user.role === 'staff') {
        const currentUserStaff = await staff.findByUserId(req.user.id);
        if (!currentUserStaff || currentUserStaff.hotel_id !== hotelId) {
          return res.status(403).json({
            success: false,
            message: 'You can only view staff from your own hotel'
          });
        }
      }

      const filters = {
        hotel_id: hotelId,
        department: req.query.department,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
      };

      const staffList = await staff.list(filters);

      // Get user details for each staff member
      const staffWithUsers = await Promise.all(
        staffList.map(async (staffMember) => {
          const user = await users.findById(staffMember.user_id);
          return {
            ...staffMember,
            user: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              avatar_url: user.avatar_url
            }
          };
        })
      );

      res.json({
        success: true,
        data: staffWithUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotel staff'
      });
    }
  })
);

// Get staff by department (admin/manager only)
router.get('/department/:department',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    try {
      const filters = {
        department: req.params.department,
        hotel_id: req.query.hotel_id,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true
      };

      const staffList = await staff.list(filters);

      // Get user details for each staff member
      const staffWithUsers = await Promise.all(
        staffList.map(async (staffMember) => {
          const user = await users.findById(staffMember.user_id);
          return {
            ...staffMember,
            user: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              avatar_url: user.avatar_url
            }
          };
        })
      );

      res.json({
        success: true,
        data: staffWithUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch department staff'
      });
    }
  })
);

// Get staff performance metrics (admin/manager only)
router.get('/:id/performance',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    try {
      const staffMember = await staff.findById(req.params.id);
      
      if (!staffMember) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Get performance metrics
      const performance = await staff.getPerformance(req.params.id);

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch staff performance'
      });
    }
  })
);

// Assign staff to housekeeping task (admin/manager only)
router.post('/:id/assign-task',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    try {
      const { roomId, date, priority, notes } = req.body;

      const staffMember = await staff.findById(req.params.id);
      
      if (!staffMember) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Create housekeeping task
      const { housekeeping } = await import('../database/models.js');
      const task = await housekeeping.create({
        room_id: roomId,
        date: date,
        status: 'pending',
        assigned_to: req.params.id,
        priority: priority || 'normal',
        notes: notes
      });

      res.status(201).json({
        success: true,
        message: 'Task assigned successfully',
        data: task
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to assign task'
      });
    }
  })
);

// Get staff schedule (admin/manager or self)
router.get('/:id/schedule',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const staffMember = await staff.findById(req.params.id);
      
      if (!staffMember) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Check permissions
      if (req.user.role === 'guest') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      if (req.user.role === 'staff' && req.user.id !== staffMember.user_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own schedule'
        });
      }

      // Return work schedule from staff record
      res.json({
        success: true,
        data: {
          work_schedule: staffMember.work_schedule,
          shift: staffMember.shift,
          department: staffMember.department
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch staff schedule'
      });
    }
  })
);

// Update staff schedule (admin/manager only)
router.put('/:id/schedule',
  authenticate,
  authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    try {
      const { work_schedule, shift } = req.body;

      const staffMember = await staff.findById(req.params.id);
      
      if (!staffMember) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      const updates = {};
      if (work_schedule !== undefined) updates.work_schedule = work_schedule;
      if (shift !== undefined) updates.shift = shift;

      const updatedStaff = await staff.update(req.params.id, updates);

      res.json({
        success: true,
        message: 'Staff schedule updated successfully',
        data: updatedStaff
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update staff schedule'
      });
    }
  })
);

export default router;
