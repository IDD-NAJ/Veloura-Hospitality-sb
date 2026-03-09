import { sql } from './connection.js';

// Database query builders and helpers for Veloura Hotel Management System

// Users (Guests, Staff, Admins)
export const users = {
  // Find user by email
  findByEmail: async (email) => {
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email} AND is_active = true
    `;
    return result[0] || null;
  },

  // Find user by ID
  findById: async (id) => {
    const result = await sql`
      SELECT * FROM users 
      WHERE id = ${id} AND is_active = true
    `;
    return result[0] || null;
  },

  // Create new user
  create: async (userData) => {
    const { email, password_hash, name, phone, role = 'guest', nationality } = userData;
    const result = await sql`
      INSERT INTO users (email, password_hash, name, phone, role, nationality)
      VALUES (${email}, ${password_hash}, ${name}, ${phone}, ${role}, ${nationality})
      RETURNING *
    `;
    return result[0];
  },

  // Update user
  update: async (id, updates) => {
    const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
    const values = fields.map(key => updates[key]);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await sql.unsafe(`
      UPDATE users 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id, ...values]);
    
    return result[0];
  },

  // List users with filters
  list: async (filters = {}) => {
    let query = sql`
      SELECT id, email, name, phone, role, nationality, loyalty_tier, 
             loyalty_points, total_stays, total_spent, is_active, created_at
      FROM users 
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.role) {
      query = sql`${query} AND role = ${filters.role}`;
    }
    if (filters.loyalty_tier) {
      query = sql`${query} AND loyalty_tier = ${filters.loyalty_tier}`;
    }
    if (filters.search) {
      query = sql`${query} AND (name ILIKE ${`%${filters.search}%`} OR email ILIKE ${`%${filters.search}%`})`;
    }
    if (filters.is_active !== undefined) {
      query = sql`${query} AND is_active = ${filters.is_active}`;
    }

    query = sql`${query} ORDER BY created_at DESC`;
    
    if (filters.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
    }
    if (filters.offset) {
      query = sql`${query} OFFSET ${filters.offset}`;
    }

    return await query;
  },

  // Update user loyalty statistics
  updateLoyaltyStats: async (userId) => {
    await sql`
      SELECT update_user_loyalty_stats(${userId})
    `;
  },

  // Soft delete user
  softDelete: async (id) => {
    const result = await sql`
      UPDATE users 
      SET is_active = false, updated_at = NOW() 
      WHERE id = ${id} 
      RETURNING *
    `;
    return result[0];
  }
};

// Hotels
export const hotels = {
  // Find hotel by ID
  findById: async (id) => {
    const result = await sql`
      SELECT * FROM hotels 
      WHERE id = ${id} AND is_active = true
    `;
    return result[0] || null;
  },

  // Create new hotel
  create: async (hotelData) => {
    const { name, description, city, country, address, postal_code, stars, 
            amenities, images, latitude, longitude, contact_email, contact_phone,
            check_in_time, check_out_time, cancellation_policy } = hotelData;
    
    const result = await sql`
      INSERT INTO hotels (
        name, description, city, country, address, postal_code, stars,
        amenities, images, latitude, longitude, contact_email, contact_phone,
        check_in_time, check_out_time, cancellation_policy
      )
      VALUES (
        ${name}, ${description}, ${city}, ${country}, ${address}, ${postal_code}, ${stars},
        ${JSON.stringify(amenities || [])}, ${JSON.stringify(images || [])}, 
        ${latitude}, ${longitude}, ${contact_email}, ${contact_phone},
        ${check_in_time || '15:00:00'}, ${check_out_time || '11:00:00'}, ${cancellation_policy}
      )
      RETURNING *
    `;
    return result[0];
  },

  // Update hotel
  update: async (id, updates) => {
    const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
    if (fields.length === 0) return null;

    const values = fields.map(key => {
      const value = updates[key];
      return typeof value === 'object' ? JSON.stringify(value) : value;
    });

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await sql.unsafe(`
      UPDATE hotels 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id, ...values]);
    
    return result[0];
  },

  // List hotels with filters (includes computed priceFrom, rating, reviewCount)
  list: async (filters = {}) => {
    // Build WHERE conditions
    const conditions = ['h.is_active = true'];
    if (filters.city) conditions.push(`h.city = '${filters.city.replace(/'/g, "''")}'`);
    if (filters.country) conditions.push(`h.country = '${filters.country.replace(/'/g, "''")}'`);
    if (filters.stars) conditions.push(`h.stars = ${parseInt(filters.stars)}`);
    if (filters.search) {
      const s = filters.search.replace(/'/g, "''");
      conditions.push(`(h.name ILIKE '%${s}%' OR h.city ILIKE '%${s}%')`);
    }
    const where = conditions.join(' AND ');
    const orderBy = filters.orderBy === 'avg_rating' ? 'avg_rating DESC' : 'h.name';
    const limit = filters.limit ? `LIMIT ${parseInt(filters.limit)}` : '';

    // Try with reviews subqueries first
    try {
      return await sql.unsafe(`
        SELECT h.*,
          COALESCE((SELECT MIN(r.base_price) FROM rooms r WHERE r.hotel_id = h.id AND r.status != 'maintenance'), 0) as price_from,
          COALESCE((SELECT ROUND(AVG(rv.rating)::numeric, 1) FROM reviews rv WHERE rv.hotel_id = h.id AND rv.is_public = true), 0) as avg_rating,
          COALESCE((SELECT COUNT(*) FROM reviews rv WHERE rv.hotel_id = h.id AND rv.is_public = true), 0) as review_count
        FROM hotels h
        WHERE ${where}
        ORDER BY ${orderBy}
        ${limit}
      `);
    } catch (e) {
      // Fallback: reviews table may not exist
      console.error('Hotels list fallback (reviews unavailable):', e.message);
      return await sql.unsafe(`
        SELECT h.*,
          COALESCE((SELECT MIN(r.base_price) FROM rooms r WHERE r.hotel_id = h.id AND r.status != 'maintenance'), 0) as price_from,
          0 as avg_rating,
          0 as review_count
        FROM hotels h
        WHERE ${where}
        ORDER BY ${orderBy}
        ${limit}
      `);
    }
  },

  // Get hotel with room count and occupancy
  getWithStats: async (id) => {
    const result = await sql`
      SELECT 
        h.*,
        COUNT(r.id) as total_rooms,
        COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms,
        COUNT(CASE WHEN r.status = 'occupied' THEN 1 END) as occupied_rooms,
        COALESCE(
          (SELECT COUNT(*) FROM bookings b 
           WHERE b.hotel_id = h.id 
           AND b.status IN ('confirmed', 'checked_in')
           AND b.check_in <= CURRENT_DATE 
           AND b.check_out > CURRENT_DATE), 0
        ) as current_occupancy
      FROM hotels h
      LEFT JOIN rooms r ON h.id = r.hotel_id
      WHERE h.id = ${id} AND h.is_active = true
      GROUP BY h.id
    `;
    return result[0] || null;
  }
};

// Rooms
export const rooms = {
  // Find room by ID
  findById: async (id) => {
    const result = await sql`
      SELECT r.*, h.name as hotel_name, h.city as hotel_city
      FROM rooms r
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.id = ${id}
    `;
    return result[0] || null;
  },

  // Create new room
  create: async (roomData) => {
    const { hotel_id, name, type, category, floor, sqm, max_guests, base_price,
            currency, amenities, images, description, bed_configuration, view_type,
            smoking_allowed, pet_friendly } = roomData;
    
    const result = await sql`
      INSERT INTO rooms (
        hotel_id, name, type, category, floor, sqm, max_guests, base_price,
        currency, amenities, images, description, bed_configuration, view_type,
        smoking_allowed, pet_friendly
      )
      VALUES (
        ${hotel_id}, ${name}, ${type}, ${category}, ${floor}, ${sqm}, ${max_guests}, ${base_price},
        ${currency || 'USD'}, ${JSON.stringify(amenities || [])}, ${JSON.stringify(images || [])},
        ${description}, ${bed_configuration}, ${view_type}, ${smoking_allowed}, ${pet_friendly}
      )
      RETURNING *
    `;
    return result[0];
  },

  // Update room
  update: async (id, updates) => {
    const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
    if (fields.length === 0) return null;

    const values = fields.map(key => {
      const value = updates[key];
      return typeof value === 'object' ? JSON.stringify(value) : value;
    });

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await sql.unsafe(`
      UPDATE rooms 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id, ...values]);
    
    return result[0];
  },

  // List rooms with filters
  list: async (filters = {}) => {
    let query = sql`
      SELECT r.*, h.name as hotel_name, h.city as hotel_city
      FROM rooms r
      JOIN hotels h ON r.hotel_id = h.id
      WHERE h.is_active = true
    `;

    if (filters.hotel_id) {
      query = sql`${query} AND r.hotel_id = ${filters.hotel_id}`;
    }
    if (filters.status) {
      query = sql`${query} AND r.status = ${filters.status}`;
    }
    if (filters.type) {
      query = sql`${query} AND r.type = ${filters.type}`;
    }
    if (filters.max_guests) {
      query = sql`${query} AND r.max_guests >= ${filters.max_guests}`;
    }
    if (filters.min_price) {
      query = sql`${query} AND r.base_price >= ${filters.min_price}`;
    }
    if (filters.max_price) {
      query = sql`${query} AND r.base_price <= ${filters.max_price}`;
    }

    query = sql`${query} ORDER BY h.name, r.floor, r.name`;

    return await query;
  },

  // Check room availability
  checkAvailability: async (roomId, checkIn, checkOut) => {
    const result = await sql`
      SELECT check_room_availability(${roomId}, ${checkIn}, ${checkOut}) as available
    `;
    return result[0].available;
  },

  // Find available rooms for dates
  findAvailable: async (hotelId, checkIn, checkOut, guests = 1) => {
    const result = await sql`
      SELECT DISTINCT r.*
      FROM rooms r
      WHERE r.hotel_id = ${hotelId}
        AND r.status = 'available'
        AND r.max_guests >= ${guests}
        AND check_room_availability(r.id, ${checkIn}, ${checkOut}) = true
      ORDER BY r.base_price
    `;
    return result;
  },

  // Update room status
  updateStatus: async (id, status) => {
    const result = await sql`
      UPDATE rooms 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${id} 
      RETURNING *
    `;
    return result[0];
  }
};

// Bookings
export const bookings = {
  // Find booking by ID
  findById: async (id) => {
    const result = await sql`
      SELECT b.*, 
             u.name as guest_name, u.email as guest_email, u.phone as guest_phone,
             h.name as hotel_name, h.city as hotel_city,
             r.name as room_name, r.type as room_type
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ${id}
    `;
    return result[0] || null;
  },

  // Find booking by reference
  findByRef: async (ref) => {
    const result = await sql`
      SELECT b.*, 
             u.name as guest_name, u.email as guest_email,
             h.name as hotel_name,
             r.name as room_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.ref = ${ref}
    `;
    return result[0] || null;
  },

  // Create new booking
  create: async (bookingData) => {
    const {
      user_id, hotel_id, room_id, check_in, check_out,
      guests = 2, adults = 2, children = 0,
      room_rate, total_amount,
      currency = 'USD', source = 'direct',
      notes = null, special_requests = null
    } = bookingData;
    
    const result = await sql`
      INSERT INTO bookings (
        user_id, hotel_id, room_id, check_in, check_out, guests, adults, children,
        room_rate, total_amount, currency, source, notes, special_requests
      )
      VALUES (
        ${user_id}, ${hotel_id}, ${room_id}, ${check_in}, ${check_out}, ${guests}, ${adults}, ${children},
        ${room_rate}, ${total_amount}, ${currency}, ${source}, ${notes}, ${special_requests}
      )
      RETURNING *
    `;
    return result[0];
  },

  // Update booking
  update: async (id, updates) => {
    const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
    if (fields.length === 0) return null;

    const values = fields.map(key => updates[key]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await sql.unsafe(`
      UPDATE bookings 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id, ...values]);
    
    return result[0];
  },

  // List bookings with filters
  list: async (filters = {}) => {
    let query = sql`
      SELECT b.*, 
             u.name as guest_name, u.email as guest_email,
             h.name as hotel_name, h.city as hotel_city,
             r.name as room_name, r.type as room_type
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `;

    if (filters.user_id) {
      query = sql`${query} AND b.user_id = ${filters.user_id}`;
    }
    if (filters.hotel_id) {
      query = sql`${query} AND b.hotel_id = ${filters.hotel_id}`;
    }
    if (filters.status) {
      query = sql`${query} AND b.status = ${filters.status}`;
    }
    if (filters.payment_status) {
      query = sql`${query} AND b.payment_status = ${filters.payment_status}`;
    }
    if (filters.check_in_from) {
      query = sql`${query} AND b.check_in >= ${filters.check_in_from}`;
    }
    if (filters.check_in_to) {
      query = sql`${query} AND b.check_in <= ${filters.check_in_to}`;
    }
    if (filters.search) {
      query = sql`${query} AND (b.ref ILIKE ${`%${filters.search}%`} OR u.name ILIKE ${`%${filters.search}%`})`;
    }

    query = sql`${query} ORDER BY b.created_at DESC`;

    if (filters.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
    }
    if (filters.offset) {
      query = sql`${query} OFFSET ${filters.offset}`;
    }

    return await query;
  },

  // Check-in guest
  checkIn: async (id) => {
    const result = await sql`
      UPDATE bookings 
      SET status = 'checked_in', updated_at = NOW() 
      WHERE id = ${id} AND status = 'confirmed'
      RETURNING *
    `;
    
    if (result[0]) {
      await sql`
        UPDATE rooms 
        SET status = 'occupied', updated_at = NOW() 
        WHERE id = (SELECT room_id FROM bookings WHERE id = ${id})
      `;
    }
    
    return result[0];
  },

  // Check-out guest
  checkOut: async (id) => {
    const result = await sql`
      UPDATE bookings 
      SET status = 'checked_out', updated_at = NOW() 
      WHERE id = ${id} AND status = 'checked_in'
      RETURNING *
    `;
    
    if (result[0]) {
      await sql`
        UPDATE rooms 
        SET status = 'available', updated_at = NOW() 
        WHERE id = (SELECT room_id FROM bookings WHERE id = ${id})
      `;
      
      // Update user loyalty stats
      await sql`
        SELECT update_user_loyalty_stats((SELECT user_id FROM bookings WHERE id = ${id}))
      `;
    }
    
    return result[0];
  },

  // Cancel booking
  cancel: async (id, reason, cancelledBy) => {
    const result = await sql`
      UPDATE bookings 
      SET status = 'cancelled', 
          cancellation_reason = ${reason},
          cancelled_by = ${cancelledBy},
          cancelled_at = NOW(),
          updated_at = NOW() 
      WHERE id = ${id} AND status NOT IN ('checked_out', 'cancelled')
      RETURNING *
    `;
    
    if (result[0]) {
      await sql`
        UPDATE rooms 
        SET status = 'available', updated_at = NOW() 
        WHERE id = (SELECT room_id FROM bookings WHERE id = ${id})
      `;
    }
    
    return result[0];
  }
};

// Payments
export const payments = {
  // Create payment record
  create: async (paymentData) => {
    const { booking_id, stripe_payment_intent_id, amount, currency, status, method,
            card_brand, card_last4, metadata } = paymentData;
    
    const result = await sql`
      INSERT INTO payments (
        booking_id, stripe_payment_intent_id, amount, currency, status, method,
        card_brand, card_last4, metadata
      )
      VALUES (
        ${booking_id}, ${stripe_payment_intent_id}, ${amount}, ${currency || 'USD'}, ${status}, ${method},
        ${card_brand}, ${card_last4}, ${JSON.stringify(metadata || {})}
      )
      RETURNING *
    `;
    return result[0];
  },

  // Update payment status
  updateStatus: async (id, status, additionalData = {}) => {
    const fields = ['status', ...Object.keys(additionalData)];
    const values = [status, ...Object.values(additionalData)];
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await sql.unsafe(`
      UPDATE payments 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id, ...values]);
    
    return result[0];
  },

  // Find payment by Stripe intent ID
  findByStripeIntentId: async (stripePaymentIntentId) => {
    const result = await sql`
      SELECT p.*, b.status as booking_status
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.stripe_payment_intent_id = ${stripePaymentIntentId}
    `;
    return result[0] || null;
  },

  // List payments for booking
  listByBooking: async (bookingId) => {
    const result = await sql`
      SELECT * FROM payments 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;
    return result;
  },

  // Process refund
  processRefund: async (id, refundAmount, refundReason) => {
    const result = await sql`
      UPDATE payments 
      SET refunded_amount = refunded_amount + ${refundAmount},
          refund_reason = ${refundReason},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }
};

// Analytics
export const analytics = {
  // Hotel occupancy rate
  getOccupancyRate: async (hotelId, startDate, endDate) => {
    const result = await sql`
      SELECT calculate_occupancy_rate(${hotelId}, ${startDate}, ${endDate}) as rate
    `;
    return parseFloat(result[0].rate);
  },

  // Hotel revenue
  getRevenue: async (hotelId, startDate, endDate) => {
    const result = await sql`
      SELECT calculate_hotel_revenue(${hotelId}, ${startDate}, ${endDate}) as revenue
    `;
    return parseFloat(result[0].revenue);
  },

  // Monthly revenue breakdown
  getMonthlyRevenue: async (hotelId, year) => {
    const result = await sql`
      SELECT 
        DATE_TRUNC('month', check_in) as month,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_booking_value,
        COUNT(DISTINCT user_id) as unique_guests
      FROM bookings
      WHERE hotel_id = ${hotelId}
        AND status NOT IN ('cancelled', 'no_show')
        AND EXTRACT(YEAR FROM check_in) = ${year}
      GROUP BY DATE_TRUNC('month', check_in)
      ORDER BY month
    `;
    return result;
  },

  // Channel performance
  getChannelPerformance: async (hotelId, startDate, endDate) => {
    const result = await sql`
      SELECT 
        source,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_booking_value,
        COUNT(DISTINCT user_id) as unique_guests
      FROM bookings
      WHERE hotel_id = ${hotelId}
        AND status NOT IN ('cancelled', 'no_show')
        AND check_in >= ${startDate}
        AND check_in <= ${endDate}
      GROUP BY source
      ORDER BY revenue DESC
    `;
    return result;
  },

  // Guest demographics
  getGuestDemographics: async (hotelId, startDate, endDate) => {
    const result = await sql`
      SELECT 
        u.nationality,
        COUNT(DISTINCT u.id) as unique_guests,
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_spent,
        AVG(b.total_amount) as avg_spent
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.hotel_id = ${hotelId}
        AND b.status NOT IN ('cancelled', 'no_show')
        AND b.check_in >= ${startDate}
        AND b.check_in <= ${endDate}
      GROUP BY u.nationality
      ORDER BY total_bookings DESC
    `;
    return result;
  },

  // Room performance
  getRoomPerformance: async (hotelId, startDate, endDate) => {
    const result = await sql`
      SELECT 
        r.id,
        r.name,
        r.type,
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_revenue,
        AVG(b.total_amount) as avg_rate,
        COUNT(DISTINCT b.check_in) as occupied_nights,
        r.base_price
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id
        AND b.status NOT IN ('cancelled', 'no_show')
        AND b.check_in >= ${startDate}
        AND b.check_in <= ${endDate}
      WHERE r.hotel_id = ${hotelId}
      GROUP BY r.id, r.name, r.type, r.base_price
      ORDER BY total_revenue DESC
    `;
    return result;
  }
};

// Staff
export const staff = {
  // Find staff by ID
  findById: async (id) => {
    const result = await sql`
      SELECT s.*, u.name, u.email, u.phone, u.avatar_url
      FROM staff s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${id}
    `;
    return result[0] || null;
  },

  // Find staff by user ID
  findByUserId: async (userId) => {
    const result = await sql`
      SELECT s.*, u.name, u.email, u.phone, u.avatar_url
      FROM staff s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ${userId}
    `;
    return result[0] || null;
  },

  // Create new staff member
  create: async (staffData) => {
    const { user_id, hotel_id, employee_id, department, position, shift, work_schedule,
            hourly_rate, salary, hire_date, emergency_contact_name, emergency_contact_phone,
            skills, certifications } = staffData;
    
    const result = await sql`
      INSERT INTO staff (
        user_id, hotel_id, employee_id, department, position, shift, work_schedule,
        hourly_rate, salary, hire_date, emergency_contact_name, emergency_contact_phone,
        skills, certifications
      )
      VALUES (
        ${user_id}, ${hotel_id}, ${employee_id}, ${department}, ${position}, ${shift},
        ${JSON.stringify(work_schedule || {})}, ${hourly_rate}, ${salary}, ${hire_date},
        ${emergency_contact_name}, ${emergency_contact_phone},
        ${JSON.stringify(skills || [])}, ${JSON.stringify(certifications || [])}
      )
      RETURNING *
    `;
    return result[0];
  },

  // Update staff member
  update: async (id, updates) => {
    const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
    if (fields.length === 0) return null;

    const values = fields.map(key => {
      const value = updates[key];
      return typeof value === 'object' ? JSON.stringify(value) : value;
    });

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await sql.unsafe(`
      UPDATE staff 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id, ...values]);
    
    return result[0];
  },

  // List staff members with filters
  list: async (filters = {}) => {
    let query = sql`
      SELECT s.*, u.name, u.email, u.phone, u.avatar_url
      FROM staff s
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;

    if (filters.hotel_id) {
      query = sql`${query} AND s.hotel_id = ${filters.hotel_id}`;
    }
    if (filters.department) {
      query = sql`${query} AND s.department = ${filters.department}`;
    }
    if (filters.is_active !== undefined) {
      query = sql`${query} AND s.is_active = ${filters.is_active}`;
    }

    query = sql`${query} ORDER BY u.name`;

    return await query;
  },

  // Get staff performance metrics
  getPerformance: async (staffId) => {
    const result = await sql`
      SELECT 
        s.*,
        u.name as staff_name,
        u.email as staff_email,
        h.name as hotel_name,
        COUNT(DISTINCT hk.id) as tasks_assigned,
        COUNT(DISTINCT CASE WHEN hk.status = 'completed' THEN hk.id END) as tasks_completed,
        AVG(EXTRACT(EPOCH FROM (hk.completed_at - hk.started_at))/3600) as avg_completion_time_hours
      FROM staff s
      JOIN users u ON s.user_id = u.id
      JOIN hotels h ON s.hotel_id = h.id
      LEFT JOIN housekeeping hk ON s.id = hk.assigned_to AND hk.date >= CURRENT_DATE - INTERVAL '30 days'
      WHERE s.id = ${staffId}
      GROUP BY s.id, u.name, u.email, h.name
    `;
    return result[0] || null;
  }
};

// Housekeeping
export const housekeeping = {
  // Create new housekeeping task
  create: async (taskData) => {
    const { room_id, date, status, assigned_to, priority, notes } = taskData;
    
    const result = await sql`
      INSERT INTO housekeeping (room_id, date, status, assigned_to, priority, notes)
      VALUES (${room_id}, ${date}, ${status}, ${assigned_to}, ${priority}, ${notes})
      RETURNING *
    `;
    return result[0];
  },

  // Update housekeeping task
  update: async (id, updates) => {
    const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
    if (fields.length === 0) return null;

    const values = fields.map(key => updates[key]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await sql.unsafe(`
      UPDATE housekeeping 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id, ...values]);
    
    return result[0];
  },

  // List housekeeping tasks
  list: async (filters = {}) => {
    let query = sql`
      SELECT hk.*, r.name as room_name, h.name as hotel_name,
             u.name as assigned_to_name
      FROM housekeeping hk
      JOIN rooms r ON hk.room_id = r.id
      JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN staff s ON hk.assigned_to = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;

    if (filters.date) {
      query = sql`${query} AND hk.date = ${filters.date}`;
    }
    if (filters.status) {
      query = sql`${query} AND hk.status = ${filters.status}`;
    }
    if (filters.assigned_to) {
      query = sql`${query} AND hk.assigned_to = ${filters.assigned_to}`;
    }

    query = sql`${query} ORDER BY hk.date, hk.priority DESC, hk.created_at`;

    return await query;
  }
};

// Room Rates
export const room_rates = {
  // Create rate
  create: async (rateData) => {
    const { room_id, date, price, currency, is_available, min_stay, max_stay,
            closed_to_arrival, closed_to_departure, channel } = rateData;
    
    const result = await sql`
      INSERT INTO room_rates (
        room_id, date, price, currency, is_available, min_stay, max_stay,
        closed_to_arrival, closed_to_departure, channel
      )
      VALUES (
        ${room_id}, ${date}, ${price}, ${currency || 'USD'}, ${is_available !== false},
        ${min_stay || 1}, ${max_stay || 30}, ${closed_to_arrival || false},
        ${closed_to_departure || false}, ${channel || 'all'}
      )
      ON CONFLICT (room_id, date, channel) DO UPDATE SET
        price = EXCLUDED.price,
        is_available = EXCLUDED.is_available,
        min_stay = EXCLUDED.min_stay,
        max_stay = EXCLUDED.max_stay,
        closed_to_arrival = EXCLUDED.closed_to_arrival,
        closed_to_departure = EXCLUDED.closed_to_departure,
        updated_at = NOW()
      RETURNING *
    `;
    return result[0];
  },

  // List rates for a room and date range
  list: async (filters = {}) => {
    let query = sql`
      SELECT rr.*, r.name as room_name, r.type as room_type
      FROM room_rates rr
      JOIN rooms r ON rr.room_id = r.id
      WHERE 1=1
    `;

    if (filters.room_id) {
      query = sql`${query} AND rr.room_id = ${filters.room_id}`;
    }
    if (filters.start_date) {
      query = sql`${query} AND rr.date >= ${filters.start_date}`;
    }
    if (filters.end_date) {
      query = sql`${query} AND rr.date <= ${filters.end_date}`;
    }
    if (filters.is_available !== undefined) {
      query = sql`${query} AND rr.is_available = ${filters.is_available}`;
    }

    query = sql`${query} ORDER BY rr.date`;

    return await query;
  },

  // Get rate for a specific room and date
  getRate: async (roomId, date) => {
    const result = await sql`
      SELECT * FROM room_rates
      WHERE room_id = ${roomId} AND date = ${date}
    `;
    return result[0] || null;
  },

  // Bulk update rates
  bulkUpdate: async (roomId, rates) => {
    const results = [];
    for (const rate of rates) {
      const result = await room_rates.create({
        room_id: roomId,
        ...rate
      });
      results.push(result);
    }
    return results;
  }
};

// Channel Sync Log
export const channelSyncLog = {
  create: async (data) => {
    const { channel, event_type, reservation_id, external_id, direction,
            raw_payload, processed_payload, status, error_message } = data;
    
    const result = await sql`
      INSERT INTO channel_sync_log (
        channel, event_type, reservation_id, external_id, direction,
        raw_payload, processed_payload, status, error_message
      )
      VALUES (
        ${channel}, ${event_type}, ${reservation_id}, ${external_id}, ${direction},
        ${JSON.stringify(raw_payload || {})}, ${JSON.stringify(processed_payload || {})},
        ${status}, ${error_message}
      )
      RETURNING *
    `;
    return result[0];
  },

  list: async (filters = {}) => {
    let query = sql`
      SELECT * FROM channel_sync_log WHERE 1=1
    `;

    if (filters.channel) {
      query = sql`${query} AND channel = ${filters.channel}`;
    }
    if (filters.status) {
      query = sql`${query} AND status = ${filters.status}`;
    }
    if (filters.since) {
      query = sql`${query} AND synced_at >= ${filters.since}`;
    }

    query = sql`${query} ORDER BY synced_at DESC LIMIT ${filters.limit || 100}`;

    return await query;
  }
};

// Reviews
export const reviews = {
  create: async (reviewData) => {
    const { booking_id, user_id, hotel_id, rating, title, body,
            staff_rating, cleanliness_rating, location_rating,
            value_rating, amenities_rating } = reviewData;
    
    const result = await sql`
      INSERT INTO reviews (
        booking_id, user_id, hotel_id, rating, title, body,
        staff_rating, cleanliness_rating, location_rating,
        value_rating, amenities_rating, is_verified
      )
      VALUES (
        ${booking_id}, ${user_id}, ${hotel_id}, ${rating}, ${title}, ${body},
        ${staff_rating}, ${cleanliness_rating}, ${location_rating},
        ${value_rating}, ${amenities_rating}, true
      )
      RETURNING *
    `;
    return result[0];
  },

  findById: async (id) => {
    const result = await sql`
      SELECT r.*, u.name as guest_name, h.name as hotel_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.id = ${id}
    `;
    return result[0] || null;
  },

  listByHotel: async (hotelId, publicOnly = true) => {
    let query = sql`
      SELECT r.*, u.name as guest_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.hotel_id = ${hotelId}
    `;

    if (publicOnly) {
      query = sql`${query} AND r.is_public = true`;
    }

    query = sql`${query} ORDER BY r.created_at DESC`;

    return await query;
  },

  respond: async (id, responseText, respondedBy) => {
    const result = await sql`
      UPDATE reviews 
      SET response_text = ${responseText}, 
          responded_by = ${respondedBy},
          responded_at = NOW(),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  getAverageRating: async (hotelId) => {
    const result = await sql`
      SELECT 
        AVG(rating) as overall,
        AVG(staff_rating) as staff,
        AVG(cleanliness_rating) as cleanliness,
        AVG(location_rating) as location,
        AVG(value_rating) as value,
        AVG(amenities_rating) as amenities,
        COUNT(*) as total_reviews
      FROM reviews
      WHERE hotel_id = ${hotelId} AND is_public = true
    `;
    return result[0];
  }
};

// Message Log
export const messageLog = {
  list: async (filters = {}) => {
    let query = sql`
      SELECT ml.*, u.name as guest_name
      FROM message_log ml
      LEFT JOIN users u ON ml.guest_id = u.id
      WHERE 1=1
    `;

    if (filters.guest_id) {
      query = sql`${query} AND ml.guest_id = ${filters.guest_id}`;
    }
    if (filters.booking_id) {
      query = sql`${query} AND ml.booking_id = ${filters.booking_id}`;
    }
    if (filters.channel) {
      query = sql`${query} AND ml.channel = ${filters.channel}`;
    }
    if (filters.status) {
      query = sql`${query} AND ml.status = ${filters.status}`;
    }

    query = sql`${query} ORDER BY ml.created_at DESC LIMIT ${filters.limit || 50}`;

    return await query;
  }
};

export default {
  users,
  hotels,
  rooms,
  bookings,
  payments,
  analytics,
  staff,
  housekeeping,
  room_rates,
  channelSyncLog,
  reviews,
  messageLog
};
