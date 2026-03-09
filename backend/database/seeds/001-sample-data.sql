-- Veloura Hotel Management System — Seed Data
-- Sample data matching the frontend mock data from hotel-admin.jsx

-- =====================================================
-- USERS (Guests, Staff, Admins)
-- =====================================================

-- Admin user (password: Admin@2024!)
INSERT INTO users (id, email, password_hash, name, phone, role, nationality, loyalty_tier, loyalty_points, total_stays, total_spent, is_active, email_verified) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@Veloura.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'System Admin', '+33612345678', 'admin', 'France', 'platinum', 50000, 0, 0.00, true, true);

-- Manager user (password: Manager@2024!)
INSERT INTO users (id, email, password_hash, name, phone, role, nationality, loyalty_tier, loyalty_points, total_stays, total_spent, is_active, email_verified) VALUES
('a0000000-0000-0000-0000-000000000002', 'manager@Veloura.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Hotel Manager', '+33612345679', 'manager', 'France', 'platinum', 25000, 0, 0.00, true, true);

-- Guest users (matching MOCK_GUESTS from hotel-admin.jsx)
INSERT INTO users (id, email, password_hash, name, phone, role, nationality, loyalty_tier, loyalty_points, total_stays, total_spent, is_active, email_verified) VALUES
('b0000000-0000-0000-0000-000000000001', 'elena.beaumont@email.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Elena Beaumont', '+33612345001', 'guest', 'France', 'platinum', 12400, 12, 48600.00, true, true),
('b0000000-0000-0000-0000-000000000002', 'james.worthington@email.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'James Worthington III', '+44712345002', 'guest', 'United Kingdom', 'gold', 8200, 8, 32800.00, true, true),
('b0000000-0000-0000-0000-000000000003', 'sakura.tanaka@email.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Sakura Tanaka', '+81312345003', 'guest', 'Japan', 'silver', 3100, 4, 12400.00, true, true),
('b0000000-0000-0000-0000-000000000004', 'marco.deluca@email.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Marco De Luca', '+39312345004', 'guest', 'Italy', 'gold', 6800, 6, 27200.00, true, true),
('b0000000-0000-0000-0000-000000000005', 'amara.osei@email.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Amara Osei', '+23312345005', 'guest', 'Ghana', 'standard', 900, 2, 3600.00, true, true),
('b0000000-0000-0000-0000-000000000006', 'lucas.petrov@email.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Lucas Petrov', '+74912345006', 'guest', 'Russia', 'silver', 4500, 5, 18000.00, true, true);

-- Staff users
INSERT INTO users (id, email, password_hash, name, phone, role, nationality, loyalty_tier, is_active, email_verified) VALUES
('c0000000-0000-0000-0000-000000000001', 'sophie.laurent@Veloura.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Sophie Laurent', '+33612345101', 'staff', 'France', 'standard', true, true),
('c0000000-0000-0000-0000-000000000002', 'thomas.moreau@Veloura.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Thomas Moreau', '+33612345102', 'staff', 'France', 'standard', true, true),
('c0000000-0000-0000-0000-000000000003', 'claire.dubois@Veloura.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Claire Dubois', '+33612345103', 'staff', 'France', 'standard', true, true),
('c0000000-0000-0000-0000-000000000004', 'antoine.bernard@Veloura.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Antoine Bernard', '+33612345104', 'staff', 'France', 'standard', true, true),
('c0000000-0000-0000-0000-000000000005', 'marie.lefebvre@Veloura.com', '$2a$12$kVPsgwxhHn8DUe4WR.viieNHeBN2E7/C/.BejwvFRPDLnDpl4MpVm', 'Marie Lefebvre', '+33612345105', 'staff', 'France', 'standard', true, true);

-- =====================================================
-- HOTELS (matching MOCK_HOTELS from hotel-admin.jsx)
-- =====================================================
INSERT INTO hotels (id, name, description, city, country, address, stars, total_rooms, amenities, latitude, longitude, contact_email, contact_phone, check_in_time, check_out_time, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'The Meridian Grand', 'A landmark of refined luxury in the heart of Paris, offering world-class dining, spa facilities, and panoramic city views from every suite.', 'Paris', 'France', '15 Avenue Montaigne, 75008 Paris', 5, 150, '["Spa", "Pool", "Restaurant", "Bar", "Gym", "Concierge", "Room Service", "Valet Parking", "Business Center", "Meeting Rooms"]', 48.8663, 2.3048, 'paris@Veloura.com', '+33145678900', '15:00:00', '11:00:00', true),
('550e8400-e29b-41d4-a716-446655440002', 'Azure Coast Resort', 'A Mediterranean paradise perched above the azure waters of the French Riviera, featuring private beach access and Michelin-starred cuisine.', 'Nice', 'France', '47 Promenade des Anglais, 06000 Nice', 5, 85, '["Private Beach", "Infinity Pool", "Spa", "Restaurant", "Bar", "Water Sports", "Tennis Court", "Helicopter Pad"]', 43.6947, 7.2653, 'nice@Veloura.com', '+33493678900', '15:00:00', '11:00:00', true),
('550e8400-e29b-41d4-a716-446655440003', 'Alpine Serenity Lodge', 'An exclusive mountain retreat offering world-class skiing, thermal baths, and fireside dining with breathtaking Alpine panoramas.', 'Chamonix', 'France', '88 Route de la Montagne, 74400 Chamonix', 5, 60, '["Ski-in/Ski-out", "Thermal Spa", "Restaurant", "Bar", "Fireplace Lounge", "Helipad", "Sauna", "Ice Rink"]', 45.9237, 6.8694, 'chamonix@Veloura.com', '+33450678900', '16:00:00', '10:00:00', true);

-- =====================================================
-- ROOMS (matching MOCK_ROOMS from hotel-admin.jsx)
-- =====================================================

-- The Meridian Grand rooms
INSERT INTO rooms (id, hotel_id, name, type, category, floor, sqm, max_guests, base_price, currency, status, amenities, bed_configuration, view_type) VALUES
('d0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440001', 'Deluxe King 301', 'Deluxe', 'room', 3, 35, 2, 420.00, 'USD', 'occupied', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning", "Nespresso Machine"]', '1 King Bed', 'city'),
('d0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440001', 'Superior Suite 502', 'Suite', 'suite', 5, 58, 2, 680.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning", "Nespresso Machine", "Living Room", "Bathrobe"]', '1 King Bed', 'city'),
('d0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440001', 'Grand Penthouse 1201', 'Penthouse', 'penthouse', 12, 120, 4, 1240.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning", "Nespresso Machine", "Living Room", "Dining Room", "Terrace", "Jacuzzi", "Butler Service"]', '2 King Beds', 'panoramic'),
('d0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440001', 'Deluxe Twin 302', 'Deluxe', 'room', 3, 35, 2, 380.00, 'USD', 'maintenance', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning"]', '2 Twin Beds', 'garden'),
('d0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440001', 'Executive Suite 801', 'Suite', 'suite', 8, 72, 3, 890.00, 'USD', 'occupied', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning", "Nespresso Machine", "Living Room", "Work Desk", "Bathrobe", "Terrace"]', '1 King Bed + 1 Sofa Bed', 'city'),
('d0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440001', 'Classic Double 201', 'Standard', 'room', 2, 28, 2, 320.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning"]', '1 Queen Bed', 'courtyard'),
('d0000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440001', 'Premium King 601', 'Premium', 'room', 6, 42, 2, 520.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning", "Nespresso Machine", "Bathrobe"]', '1 King Bed', 'city'),
('d0000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440001', 'Junior Suite 702', 'Suite', 'suite', 7, 48, 2, 620.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning", "Living Area"]', '1 King Bed', 'garden');

-- Azure Coast Resort rooms
INSERT INTO rooms (id, hotel_id, name, type, category, floor, sqm, max_guests, base_price, currency, status, amenities, bed_configuration, view_type) VALUES
('d0000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440002', 'Sea View Deluxe 101', 'Deluxe', 'room', 1, 38, 2, 480.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning", "Balcony"]', '1 King Bed', 'ocean'),
('d0000000-0000-0000-0000-000000000010', '550e8400-e29b-41d4-a716-446655440002', 'Beach Suite 201', 'Suite', 'suite', 2, 65, 3, 920.00, 'USD', 'occupied', '["WiFi", "Minibar", "Safe", "TV", "Air Conditioning", "Private Terrace", "Direct Beach Access"]', '1 King Bed + Daybed', 'ocean'),
('d0000000-0000-0000-0000-000000000011', '550e8400-e29b-41d4-a716-446655440002', 'Mediterranean Villa', 'Villa', 'villa', 1, 150, 6, 2200.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Private Pool", "Kitchen", "Garden", "Butler Service"]', '3 King Beds', 'ocean');

-- Alpine Serenity Lodge rooms
INSERT INTO rooms (id, hotel_id, name, type, category, floor, sqm, max_guests, base_price, currency, status, amenities, bed_configuration, view_type) VALUES
('d0000000-0000-0000-0000-000000000012', '550e8400-e29b-41d4-a716-446655440003', 'Mountain View Room', 'Standard', 'room', 2, 32, 2, 350.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Fireplace", "Ski Storage"]', '1 King Bed', 'mountain'),
('d0000000-0000-0000-0000-000000000013', '550e8400-e29b-41d4-a716-446655440003', 'Alpine Chalet Suite', 'Suite', 'suite', 3, 85, 4, 1100.00, 'USD', 'available', '["WiFi", "Minibar", "Safe", "TV", "Fireplace", "Private Balcony", "Hot Tub", "Ski Storage"]', '2 King Beds', 'mountain');

-- =====================================================
-- BOOKINGS (matching MOCK_BOOKINGS from hotel-admin.jsx)
-- =====================================================
INSERT INTO bookings (id, ref, user_id, hotel_id, room_id, check_in, check_out, guests, adults, children, room_rate, total_amount, currency, status, payment_status, source) VALUES
('e0000000-0000-0000-0000-000000000001', 'VLR-4829', 'b0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440001', 'd0000000-0000-0000-0000-000000000001', CURRENT_DATE, CURRENT_DATE + 3, 2, 2, 0, 420.00, 1260.00, 'USD', 'checked_in', 'paid', 'direct'),
('e0000000-0000-0000-0000-000000000002', 'VLR-3847', 'b0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440001', 'd0000000-0000-0000-0000-000000000005', CURRENT_DATE + 1, CURRENT_DATE + 5, 2, 2, 0, 890.00, 3560.00, 'USD', 'confirmed', 'paid', 'booking.com'),
('e0000000-0000-0000-0000-000000000003', 'VLR-9215', 'b0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440001', 'd0000000-0000-0000-0000-000000000002', CURRENT_DATE + 2, CURRENT_DATE + 4, 1, 1, 0, 680.00, 1360.00, 'USD', 'confirmed', 'paid', 'expedia'),
('e0000000-0000-0000-0000-000000000004', 'VLR-6731', 'b0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440002', 'd0000000-0000-0000-0000-000000000010', CURRENT_DATE - 1, CURRENT_DATE + 2, 2, 2, 0, 920.00, 2760.00, 'USD', 'checked_in', 'paid', 'direct'),
('e0000000-0000-0000-0000-000000000005', 'VLR-2058', 'b0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440001', 'd0000000-0000-0000-0000-000000000003', CURRENT_DATE + 5, CURRENT_DATE + 8, 3, 2, 1, 1240.00, 3720.00, 'USD', 'pending', 'unpaid', 'airbnb'),
('e0000000-0000-0000-0000-000000000006', 'VLR-7194', 'b0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440001', 'd0000000-0000-0000-0000-000000000007', CURRENT_DATE - 5, CURRENT_DATE - 2, 2, 2, 0, 520.00, 1560.00, 'USD', 'checked_out', 'paid', 'direct'),
('e0000000-0000-0000-0000-000000000007', 'VLR-5423', 'b0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440003', 'd0000000-0000-0000-0000-000000000013', CURRENT_DATE + 10, CURRENT_DATE + 14, 4, 2, 2, 1100.00, 4400.00, 'USD', 'confirmed', 'paid', 'direct');

-- =====================================================
-- PAYMENTS
-- =====================================================
INSERT INTO payments (id, booking_id, amount, currency, status, method, card_brand, card_last4) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 1260.00, 'USD', 'succeeded', 'card', 'visa', '4242'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 3560.00, 'USD', 'succeeded', 'card', 'mastercard', '5555'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 1360.00, 'USD', 'succeeded', 'card', 'visa', '1234'),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 2760.00, 'USD', 'succeeded', 'card', 'amex', '3782'),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 1560.00, 'USD', 'succeeded', 'card', 'visa', '9876'),
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007', 4400.00, 'USD', 'succeeded', 'card', 'visa', '4242');

-- =====================================================
-- STAFF RECORDS (matching MOCK_STAFF from hotel-admin.jsx)
-- =====================================================
INSERT INTO staff (id, user_id, hotel_id, employee_id, department, position, shift, is_active, hire_date) VALUES
('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440001', 'VLR-EMP-001', 'front_desk', 'Front Desk Manager', 'morning', true, '2022-03-15'),
('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440001', 'VLR-EMP-002', 'concierge', 'Head Concierge', 'morning', true, '2021-06-01'),
('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440001', 'VLR-EMP-003', 'housekeeping', 'Housekeeping Supervisor', 'morning', true, '2022-01-10'),
('50000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440001', 'VLR-EMP-004', 'restaurant', 'Executive Chef', 'flexible', true, '2020-09-20'),
('50000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440001', 'VLR-EMP-005', 'spa', 'Spa Director', 'morning', true, '2023-02-01');

-- =====================================================
-- REVIEWS
-- =====================================================
INSERT INTO reviews (id, booking_id, user_id, hotel_id, rating, title, body, staff_rating, cleanliness_rating, location_rating, value_rating, amenities_rating, is_public, is_verified) VALUES
('40000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440001', 5, 'Exceptional in every way', 'From the moment we arrived, the staff at The Meridian Grand made us feel like royalty. The room was immaculate, the views breathtaking, and the dining experience was world-class. Cannot wait to return.', 5, 5, 5, 4, 5, true, true);

-- =====================================================
-- HOUSEKEEPING
-- =====================================================
INSERT INTO housekeeping (room_id, date, status, assigned_to, priority, notes) VALUES
('d0000000-0000-0000-0000-000000000001', CURRENT_DATE, 'clean', '50000000-0000-0000-0000-000000000003', 'normal', 'Guest checked in, room prepared'),
('d0000000-0000-0000-0000-000000000002', CURRENT_DATE, 'clean', '50000000-0000-0000-0000-000000000003', 'normal', 'Ready for next guest'),
('d0000000-0000-0000-0000-000000000004', CURRENT_DATE, 'in_progress', '50000000-0000-0000-0000-000000000003', 'high', 'Maintenance repair — bathroom fixture'),
('d0000000-0000-0000-0000-000000000006', CURRENT_DATE, 'inspection_required', '50000000-0000-0000-0000-000000000003', 'normal', 'Deep clean completed, needs inspection');

-- =====================================================
-- ROOM RATES (next 7 days)
-- =====================================================
INSERT INTO room_rates (room_id, date, price, currency, is_available) VALUES
('d0000000-0000-0000-0000-000000000002', CURRENT_DATE, 680.00, 'USD', true),
('d0000000-0000-0000-0000-000000000002', CURRENT_DATE + 1, 680.00, 'USD', true),
('d0000000-0000-0000-0000-000000000002', CURRENT_DATE + 2, 720.00, 'USD', false),
('d0000000-0000-0000-0000-000000000002', CURRENT_DATE + 3, 720.00, 'USD', false),
('d0000000-0000-0000-0000-000000000002', CURRENT_DATE + 4, 750.00, 'USD', true),
('d0000000-0000-0000-0000-000000000003', CURRENT_DATE, 1240.00, 'USD', true),
('d0000000-0000-0000-0000-000000000003', CURRENT_DATE + 1, 1240.00, 'USD', true),
('d0000000-0000-0000-0000-000000000003', CURRENT_DATE + 2, 1340.00, 'USD', true),
('d0000000-0000-0000-0000-000000000006', CURRENT_DATE, 320.00, 'USD', true),
('d0000000-0000-0000-0000-000000000006', CURRENT_DATE + 1, 320.00, 'USD', true),
('d0000000-0000-0000-0000-000000000006', CURRENT_DATE + 2, 350.00, 'USD', true),
('d0000000-0000-0000-0000-000000000007', CURRENT_DATE, 520.00, 'USD', true),
('d0000000-0000-0000-0000-000000000007', CURRENT_DATE + 1, 520.00, 'USD', true);

-- =====================================================
-- SEED COMPLETE
-- =====================================================

-- Notes:
-- All password hashes are for the password: Admin@2024!
-- In production, regenerate all passwords and hashes
-- CURRENT_DATE is used for bookings so data is always relative to today
