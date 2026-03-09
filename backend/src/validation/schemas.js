import Joi from 'joi';

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
      'any.required': 'Password is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    nationality: Joi.string().max(50).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
      'any.required': 'New password is required'
    })
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional(),
    nationality: Joi.string().max(50).optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required'
    }),
    newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
      'any.required': 'New password is required'
    })
  })
};

// Hotel validation schemas
export const hotelSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required().messages({
      'string.min': 'Hotel name must be at least 2 characters long',
      'string.max': 'Hotel name must not exceed 200 characters',
      'any.required': 'Hotel name is required'
    }),
    description: Joi.string().max(1000).optional(),
    city: Joi.string().min(2).max(100).required().messages({
      'string.min': 'City must be at least 2 characters long',
      'string.max': 'City must not exceed 100 characters',
      'any.required': 'City is required'
    }),
    country: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Country must be at least 2 characters long',
      'string.max': 'Country must not exceed 100 characters',
      'any.required': 'Country is required'
    }),
    address: Joi.string().max(500).optional(),
    postal_code: Joi.string().max(20).optional(),
    stars: Joi.number().integer().min(1).max(5).optional().messages({
      'number.min': 'Stars must be between 1 and 5',
      'number.max': 'Stars must be between 1 and 5'
    }),
    amenities: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    contact_email: Joi.string().email().optional(),
    contact_phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional(),
    check_in_time: Joi.string().pattern(new RegExp('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')).optional(),
    check_out_time: Joi.string().pattern(new RegExp('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')).optional(),
    cancellation_policy: Joi.string().max(2000).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    city: Joi.string().min(2).max(100).optional(),
    country: Joi.string().min(2).max(100).optional(),
    address: Joi.string().max(500).optional(),
    postal_code: Joi.string().max(20).optional(),
    stars: Joi.number().integer().min(1).max(5).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    contact_email: Joi.string().email().optional(),
    contact_phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional(),
    check_in_time: Joi.string().pattern(new RegExp('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')).optional(),
    check_out_time: Joi.string().pattern(new RegExp('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')).optional(),
    cancellation_policy: Joi.string().max(2000).optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

// Room validation schemas
export const roomSchemas = {
  create: Joi.object({
    hotel_id: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid hotel ID format',
      'any.required': 'Hotel ID is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Room name must be at least 2 characters long',
      'string.max': 'Room name must not exceed 100 characters',
      'any.required': 'Room name is required'
    }),
    type: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Room type must be at least 2 characters long',
      'string.max': 'Room type must not exceed 50 characters',
      'any.required': 'Room type is required'
    }),
    category: Joi.string().valid('room', 'suite', 'villa', 'penthouse').optional(),
    floor: Joi.number().integer().min(1).max(100).optional(),
    sqm: Joi.number().integer().min(1).max(1000).optional(),
    max_guests: Joi.number().integer().min(1).max(20).optional(),
    base_price: Joi.number().min(0).precision(2).required().messages({
      'number.min': 'Base price must be positive',
      'any.required': 'Base price is required'
    }),
    currency: Joi.string().length(3).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    description: Joi.string().max(1000).optional(),
    bed_configuration: Joi.string().max(100).optional(),
    view_type: Joi.string().max(50).optional(),
    smoking_allowed: Joi.boolean().optional(),
    pet_friendly: Joi.boolean().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    type: Joi.string().min(2).max(50).optional(),
    category: Joi.string().valid('room', 'suite', 'villa', 'penthouse').optional(),
    floor: Joi.number().integer().min(1).max(100).optional(),
    sqm: Joi.number().integer().min(1).max(1000).optional(),
    max_guests: Joi.number().integer().min(1).max(20).optional(),
    base_price: Joi.number().min(0).precision(2).optional(),
    currency: Joi.string().length(3).optional(),
    status: Joi.string().valid('available', 'occupied', 'maintenance', 'blocked', 'out_of_order').optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    description: Joi.string().max(1000).optional(),
    bed_configuration: Joi.string().max(100).optional(),
    view_type: Joi.string().max(50).optional(),
    smoking_allowed: Joi.boolean().optional(),
    pet_friendly: Joi.boolean().optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  availability: Joi.object({
    hotel_id: Joi.string().uuid().required(),
    check_in: Joi.date().iso().required().messages({
      'any.required': 'Check-in date is required'
    }),
    check_out: Joi.date().iso().min(Joi.ref('check_in')).required().messages({
      'date.min': 'Check-out date must be after check-in date',
      'any.required': 'Check-out date is required'
    }),
    guests: Joi.number().integer().min(1).max(20).optional(),
    min_price: Joi.number().min(0).precision(2).optional(),
    max_price: Joi.number().min(0).precision(2).optional(),
    room_type: Joi.string().optional()
  })
};

// Booking validation schemas
export const bookingSchemas = {
  create: Joi.object({
    user_id: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid user ID format',
      'any.required': 'User ID is required'
    }),
    hotel_id: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid hotel ID format',
      'any.required': 'Hotel ID is required'
    }),
    room_id: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid room ID format',
      'any.required': 'Room ID is required'
    }),
    check_in: Joi.date().iso().min('now').required().messages({
      'date.min': 'Check-in date must be in the future',
      'any.required': 'Check-in date is required'
    }),
    check_out: Joi.date().iso().min(Joi.ref('check_in')).required().messages({
      'date.min': 'Check-out date must be after check-in date',
      'any.required': 'Check-out date is required'
    }),
    guests: Joi.number().integer().min(1).max(20).optional(),
    adults: Joi.number().integer().min(1).max(20).optional(),
    children: Joi.number().integer().min(0).max(20).optional(),
    room_rate: Joi.number().min(0).precision(2).optional(),
    total_amount: Joi.number().min(0).precision(2).required().messages({
      'number.min': 'Total amount must be positive',
      'any.required': 'Total amount is required'
    }),
    currency: Joi.string().length(3).optional(),
    source: Joi.string().valid('direct', 'booking.com', 'expedia', 'airbnb', 'phone', 'walk_in').optional(),
    notes: Joi.string().max(1000).optional(),
    special_requests: Joi.string().max(1000).optional()
  }),

  update: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show').optional(),
    payment_status: Joi.string().valid('unpaid', 'partial', 'paid', 'refunded', 'failed').optional(),
    notes: Joi.string().max(1000).optional(),
    special_requests: Joi.string().max(1000).optional(),
    guest_notes: Joi.string().max(1000).optional(),
    adults: Joi.number().integer().min(1).max(20).optional(),
    children: Joi.number().integer().min(0).max(20).optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  cancel: Joi.object({
    reason: Joi.string().max(500).required().messages({
      'any.required': 'Cancellation reason is required'
    })
  }),

  list: Joi.object({
    user_id: Joi.string().uuid().optional(),
    hotel_id: Joi.string().uuid().optional(),
    status: Joi.string().valid('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show').optional(),
    payment_status: Joi.string().valid('unpaid', 'partial', 'paid', 'refunded', 'failed').optional(),
    check_in_from: Joi.date().iso().optional(),
    check_in_to: Joi.date().iso().optional(),
    search: Joi.string().max(100).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    offset: Joi.number().integer().min(0).optional()
  })
};

// Payment validation schemas
export const paymentSchemas = {
  createIntent: Joi.object({
    booking_id: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid booking ID format',
      'any.required': 'Booking ID is required'
    }),
    amount: Joi.number().min(0.5).precision(2).required().messages({
      'number.min': 'Amount must be at least 0.50',
      'any.required': 'Amount is required'
    }),
    currency: Joi.string().length(3).optional(),
    metadata: Joi.object().optional()
  }),

  confirm: Joi.object({
    payment_intent_id: Joi.string().required().messages({
      'any.required': 'Payment intent ID is required'
    })
  }),

  refund: Joi.object({
    payment_intent_id: Joi.string().required().messages({
      'any.required': 'Payment intent ID is required'
    }),
    amount: Joi.number().min(0.5).precision(2).required().messages({
      'number.min': 'Refund amount must be at least 0.50',
      'any.required': 'Refund amount is required'
    }),
    reason: Joi.string().max(500).required().messages({
      'any.required': 'Refund reason is required'
    })
  })
};

// Review validation schemas
export const reviewSchemas = {
  create: Joi.object({
    booking_id: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid booking ID format',
      'any.required': 'Booking ID is required'
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required'
    }),
    title: Joi.string().max(200).optional(),
    body: Joi.string().max(2000).required().messages({
      'string.max': 'Review body must not exceed 2000 characters',
      'any.required': 'Review body is required'
    }),
    staff_rating: Joi.number().integer().min(1).max(5).optional(),
    cleanliness_rating: Joi.number().integer().min(1).max(5).optional(),
    location_rating: Joi.number().integer().min(1).max(5).optional(),
    value_rating: Joi.number().integer().min(1).max(5).optional(),
    amenities_rating: Joi.number().integer().min(1).max(5).optional()
  })
};

// Analytics validation schemas
export const analyticsSchemas = {
  occupancy: Joi.object({
    hotel_id: Joi.string().uuid().required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
  }),

  revenue: Joi.object({
    hotel_id: Joi.string().uuid().required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
    group_by: Joi.string().valid('day', 'week', 'month', 'year').optional()
  }),

  channelPerformance: Joi.object({
    hotel_id: Joi.string().uuid().required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
  })
};

// Staff validation schemas
export const staffSchemas = {
  create: Joi.object({
    user_id: Joi.string().uuid().required(),
    hotel_id: Joi.string().uuid().required(),
    employee_id: Joi.string().max(50).optional(),
    department: Joi.string().valid('front_desk', 'housekeeping', 'concierge', 'restaurant', 'spa', 'maintenance', 'management', 'other').required(),
    position: Joi.string().min(2).max(100).required(),
    shift: Joi.string().valid('morning', 'afternoon', 'evening', 'night', 'flexible').optional(),
    work_schedule: Joi.object().optional(),
    hourly_rate: Joi.number().min(0).precision(2).optional(),
    salary: Joi.number().min(0).precision(2).optional(),
    hire_date: Joi.date().iso().optional(),
    emergency_contact_name: Joi.string().max(100).optional(),
    emergency_contact_phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    certifications: Joi.array().items(Joi.string()).optional()
  }),

  update: Joi.object({
    employee_id: Joi.string().max(50).optional(),
    department: Joi.string().valid('front_desk', 'housekeeping', 'concierge', 'restaurant', 'spa', 'maintenance', 'management', 'other').optional(),
    position: Joi.string().min(2).max(100).optional(),
    shift: Joi.string().valid('morning', 'afternoon', 'evening', 'night', 'flexible').optional(),
    work_schedule: Joi.object().optional(),
    hourly_rate: Joi.number().min(0).precision(2).optional(),
    salary: Joi.number().min(0).precision(2).optional(),
    is_active: Joi.boolean().optional(),
    emergency_contact_name: Joi.string().max(100).optional(),
    emergency_contact_phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    certifications: Joi.array().items(Joi.string()).optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

// Export all schemas
export default {
  userSchemas,
  hotelSchemas,
  roomSchemas,
  bookingSchemas,
  paymentSchemas,
  reviewSchemas,
  analyticsSchemas,
  staffSchemas
};
