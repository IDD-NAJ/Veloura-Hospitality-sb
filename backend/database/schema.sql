-- Veloura Hotel Management System - Database Schema
-- PostgreSQL Schema for Neon Database
-- Run this in Neon SQL Editor to set up the complete database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (Guests, Staff, Admins)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'staff', 'manager', 'admin')),
    nationality TEXT,
    loyalty_tier TEXT DEFAULT 'standard' CHECK (loyalty_tier IN ('standard', 'silver', 'gold', 'platinum')),
    loyalty_points INTEGER DEFAULT 0,
    total_stays INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0.00,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HOTELS TABLE
-- =====================================================
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    total_rooms INTEGER DEFAULT 0,
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    contact_email TEXT,
    contact_phone TEXT,
    check_in_time TIME DEFAULT '15:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    cancellation_policy TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROOMS TABLE
-- =====================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    cloudbeds_room_id TEXT UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Deluxe, Suite, Standard, etc.
    category TEXT DEFAULT 'room' CHECK (category IN ('room', 'suite', 'villa', 'penthouse')),
    floor INTEGER,
    sqm INTEGER,
    max_guests INTEGER DEFAULT 2,
    base_price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'blocked', 'out_of_order')),
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    description TEXT,
    bed_configuration TEXT, -- e.g., "1 King Bed", "2 Twin Beds"
    view_type TEXT, -- e.g., "city", "ocean", "garden"
    smoking_allowed BOOLEAN DEFAULT FALSE,
    pet_friendly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE DEFAULT UPPER(LEFT(uuid_generate_v4()::TEXT, 8)),
    user_id UUID REFERENCES users(id),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    cloudbeds_reservation_id TEXT UNIQUE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
    guests INTEGER DEFAULT 1,
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    room_rate NUMERIC(10,2),
    total_amount NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded', 'failed')),
    stripe_payment_intent_id TEXT,
    source TEXT DEFAULT 'direct' CHECK (source IN ('direct', 'booking.com', 'expedia', 'airbnb', 'phone', 'walk_in')),
    channel TEXT DEFAULT 'direct',
    notes TEXT,
    special_requests TEXT,
    guest_notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    stripe_payment_intent_id TEXT UNIQUE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled', 'failed')),
    method TEXT CHECK (method IN ('card', 'bank_transfer', 'cash', 'check', 'other')),
    card_brand TEXT,
    card_last4 TEXT,
    failure_reason TEXT,
    refunded_amount NUMERIC(10,2) DEFAULT 0.00,
    refund_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    body TEXT,
    staff_rating INTEGER CHECK (staff_rating BETWEEN 1 AND 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
    location_rating INTEGER CHECK (location_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 5),
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- Verified stay
    response_text TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STAFF TABLE
-- =====================================================
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    employee_id TEXT UNIQUE,
    department TEXT NOT NULL CHECK (department IN ('front_desk', 'housekeeping', 'concierge', 'restaurant', 'spa', 'maintenance', 'management', 'other')),
    position TEXT NOT NULL,
    shift TEXT CHECK (shift IN ('morning', 'afternoon', 'evening', 'night', 'flexible')),
    work_schedule JSONB DEFAULT '{}',
    hourly_rate NUMERIC(8,2),
    salary NUMERIC(10,2),
    hire_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    skills JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MESSAGE LOG TABLE
-- =====================================================
CREATE TABLE message_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'push')),
    direction TEXT DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    provider_id TEXT, -- External service ID (Twilio SID, SendGrid ID, etc.)
    template_id TEXT,
    template_data JSONB DEFAULT '{}',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHANNEL SYNC LOG TABLE
-- =====================================================
CREATE TABLE channel_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel TEXT NOT NULL CHECK (channel IN ('booking.com', 'expedia', 'airbnb', 'direct', 'cloudbeds')),
    event_type TEXT NOT NULL, -- reservation_created, modified, cancelled, etc.
    reservation_id UUID REFERENCES bookings(id),
    external_id TEXT, -- ID from external system
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    raw_payload JSONB,
    processed_payload JSONB,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed', 'retry')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROOM RATES TABLE
-- =====================================================
CREATE TABLE room_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    date DATE NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    is_available BOOLEAN DEFAULT TRUE,
    min_stay INTEGER DEFAULT 1,
    max_stay INTEGER DEFAULT 30,
    closed_to_arrival BOOLEAN DEFAULT FALSE,
    closed_to_departure BOOLEAN DEFAULT FALSE,
    channel TEXT DEFAULT 'all', -- Specific channel or 'all'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, date, channel)
);

-- =====================================================
-- HOUSEKEEPING TABLE
-- =====================================================
CREATE TABLE housekeeping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('clean', 'dirty', 'in_progress', 'inspection_required', 'out_of_service')),
    assigned_to UUID REFERENCES staff(id),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    inspected_by UUID REFERENCES staff(id),
    inspected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, date)
);

-- =====================================================
-- AMENITY INVENTORY TABLE
-- =====================================================
CREATE TABLE amenity_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    room_id UUID REFERENCES rooms(id),
    amenity_type TEXT NOT NULL, -- towel, soap, shampoo, etc.
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'piece', -- piece, bottle, kg, etc.
    last_restocked DATE,
    cost_per_unit NUMERIC(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id),
    type TEXT NOT NULL CHECK (type IN ('occupancy', 'revenue', 'guest_satisfaction', 'channel_performance', 'financial')),
    title TEXT NOT NULL,
    description TEXT,
    parameters JSONB DEFAULT '{}',
    file_path TEXT,
    file_size INTEGER,
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- =====================================================
-- AUDIT LOG TABLE
-- =====================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL, -- create, update, delete, login, etc.
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_loyalty_tier ON users(loyalty_tier);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Hotels indexes
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_country ON hotels(country);
CREATE INDEX idx_hotels_is_active ON hotels(is_active);

-- Rooms indexes
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_base_price ON rooms(base_price);

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_ref ON bookings(ref);

-- Payments indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Reviews indexes
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_public ON reviews(is_public);

-- Staff indexes
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_hotel_id ON staff(hotel_id);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- Message log indexes
CREATE INDEX idx_message_log_guest_id ON message_log(guest_id);
CREATE INDEX idx_message_log_booking_id ON message_log(booking_id);
CREATE INDEX idx_message_log_channel ON message_log(channel);
CREATE INDEX idx_message_log_status ON message_log(status);
CREATE INDEX idx_message_log_created_at ON message_log(created_at);

-- Channel sync log indexes
CREATE INDEX idx_channel_sync_log_channel ON channel_sync_log(channel);
CREATE INDEX idx_channel_sync_log_reservation_id ON channel_sync_log(reservation_id);
CREATE INDEX idx_channel_sync_log_status ON channel_sync_log(status);
CREATE INDEX idx_channel_sync_log_synced_at ON channel_sync_log(synced_at);

-- Room rates indexes
CREATE INDEX idx_room_rates_room_id ON room_rates(room_id);
CREATE INDEX idx_room_rates_date ON room_rates(date);
CREATE INDEX idx_room_rates_is_available ON room_rates(is_available);

-- Housekeeping indexes
CREATE INDEX idx_housekeeping_room_id ON housekeeping(room_id);
CREATE INDEX idx_housekeeping_date ON housekeeping(date);
CREATE INDEX idx_housekeeping_status ON housekeeping(status);
CREATE INDEX idx_housekeeping_assigned_to ON housekeeping(assigned_to);

-- Amenity inventory indexes
CREATE INDEX idx_amenity_inventory_hotel_id ON amenity_inventory(hotel_id);
CREATE INDEX idx_amenity_inventory_room_id ON amenity_inventory(room_id);
CREATE INDEX idx_amenity_inventory_amenity_type ON amenity_inventory(amenity_type);

-- Reports indexes
CREATE INDEX idx_reports_hotel_id ON reports(hotel_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);

-- Audit log indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_rates_updated_at BEFORE UPDATE ON room_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_housekeeping_updated_at BEFORE UPDATE ON housekeeping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amenity_inventory_updated_at BEFORE UPDATE ON amenity_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check room availability
CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id UUID,
    p_check_in DATE,
    p_check_out DATE
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE room_id = p_room_id
          AND status NOT IN ('cancelled', 'no_show')
          AND check_in < p_check_out
          AND check_out > p_check_in
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate hotel occupancy rate
CREATE OR REPLACE FUNCTION calculate_occupancy_rate(
    p_hotel_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS NUMERIC AS $$
DECLARE
    total_rooms INTEGER;
    occupied_rooms INTEGER;
    occupancy_rate NUMERIC;
BEGIN
    -- Get total rooms for the hotel
    SELECT COUNT(*) INTO total_rooms
    FROM rooms
    WHERE hotel_id = p_hotel_id AND status = 'available';
    
    -- Get occupied rooms for the date range
    SELECT COUNT(DISTINCT room_id) INTO occupied_rooms
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE r.hotel_id = p_hotel_id
      AND b.status IN ('confirmed', 'checked_in')
      AND b.check_in <= p_end_date
      AND b.check_out > p_start_date;
    
    -- Calculate occupancy rate
    IF total_rooms > 0 THEN
        occupancy_rate := (occupied_rooms::NUMERIC / total_rooms::NUMERIC) * 100;
    ELSE
        occupancy_rate := 0;
    END IF;
    
    RETURN occupancy_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total revenue for a hotel
CREATE OR REPLACE FUNCTION calculate_hotel_revenue(
    p_hotel_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS NUMERIC AS $$
DECLARE
    total_revenue NUMERIC;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue
    FROM bookings
    WHERE hotel_id = p_hotel_id
      AND status NOT IN ('cancelled', 'no_show')
      AND check_in >= p_start_date
      AND check_in <= p_end_date;
    
    RETURN total_revenue;
END;
$$ LANGUAGE plpgsql;

-- Function to update user loyalty statistics
CREATE OR REPLACE FUNCTION update_user_loyalty_stats(
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    total_stays INTEGER;
    total_spent NUMERIC;
BEGIN
    -- Calculate total stays and spent amount
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_amount), 0)
    INTO total_stays, total_spent
    FROM bookings
    WHERE user_id = p_user_id
      AND status IN ('checked_out', 'confirmed');
    
    -- Update user record
    UPDATE users
    SET 
        total_stays = total_stays,
        total_spent = total_spent,
        loyalty_points = FLOOR(total_spent / 10), -- 1 point per $10 spent
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Update loyalty tier based on points
    UPDATE users
    SET loyalty_tier = CASE
        WHEN loyalty_points >= 10000 THEN 'platinum'
        WHEN loyalty_points >= 5000 THEN 'gold'
        WHEN loyalty_points >= 2000 THEN 'silver'
        ELSE 'standard'
    END
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Audit log trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_user_id UUID := NULL;
BEGIN
    -- Safely try to extract user_id from the record
    BEGIN
        IF TG_OP = 'DELETE' THEN
            audit_user_id := OLD.user_id;
        ELSE
            audit_user_id := NEW.user_id;
        END IF;
    EXCEPTION WHEN undefined_column THEN
        audit_user_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, new_values)
        VALUES (audit_user_id, 'create', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (audit_user_id, 'update', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values)
        VALUES (audit_user_id, 'delete', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_reviews AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- VIEWS
-- =====================================================

-- View for booking details with related information
CREATE VIEW booking_details AS
SELECT 
    b.*,
    u.name as guest_name,
    u.email as guest_email,
    u.phone as guest_phone,
    h.name as hotel_name,
    h.city as hotel_city,
    r.name as room_name,
    r.type as room_type,
    r.base_price as room_base_price,
    p.status as latest_payment_status,
    p.amount as payment_amount,
    p.method as payment_method
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN hotels h ON b.hotel_id = h.id
LEFT JOIN rooms r ON b.room_id = r.id
LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'succeeded';

-- View for hotel performance metrics
CREATE VIEW hotel_performance AS
SELECT 
    h.id as hotel_id,
    h.name as hotel_name,
    h.city,
    h.country,
    COUNT(DISTINCT r.id) as total_rooms,
    COUNT(DISTINCT CASE WHEN r.status = 'available' THEN r.id END) as available_rooms,
    COUNT(DISTINCT CASE WHEN r.status = 'occupied' THEN r.id END) as occupied_rooms,
    COALESCE(
        (SELECT COUNT(*) FROM bookings b 
         WHERE b.hotel_id = h.id 
         AND b.status IN ('confirmed', 'checked_in')
         AND b.check_in <= CURRENT_DATE 
         AND b.check_out > CURRENT_DATE), 0
    ) as current_occupancy,
    COALESCE(
        (SELECT SUM(total_amount) FROM bookings b 
         WHERE b.hotel_id = h.id 
         AND b.status NOT IN ('cancelled', 'no_show')
         AND b.check_in >= DATE_TRUNC('month', CURRENT_DATE)
         AND b.check_in < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'), 0
    ) as monthly_revenue,
    COALESCE(
        (SELECT AVG(rating) FROM reviews rev 
         WHERE rev.hotel_id = h.id 
         AND rev.is_public = true), 0
    ) as average_rating
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
GROUP BY h.id, h.name, h.city, h.country;

-- View for staff performance
CREATE VIEW staff_performance AS
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
GROUP BY s.id, u.name, u.email, h.name;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- The database is now ready for use with the Veloura Hotel Management System
-- All tables, indexes, triggers, functions, and views have been created
-- Run seed data separately with: npm run db:seed
