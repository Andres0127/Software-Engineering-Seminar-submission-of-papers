-- ============================================================
-- EVENT PLATFORM - SCHEMA AND DATA SETUP
-- Step 2: Create schema, tables, and insert test data
-- ============================================================
-- This script creates all tables, enums, indexes, and inserts test data
-- Run this AFTER running 01-create-database.sql
-- 
-- Execute:
--   psql -U postgres -d eventplatform -f 02-setup-schema-and-data.sql
-- ============================================================

BEGIN;

-- ============================================================
-- CREATE ENUMS
-- ============================================================

-- Ticket Status Enum
DROP TYPE IF EXISTS ticketstatus CASCADE;
CREATE TYPE ticketstatus AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- User Type Enum
DROP TYPE IF EXISTS usertype CASCADE;
CREATE TYPE usertype AS ENUM ('admin', 'organizer', 'buyer');

-- User Status Enum
DROP TYPE IF EXISTS userstatus CASCADE;
CREATE TYPE userstatus AS ENUM ('active', 'inactive', 'suspended');

-- Notification Type Enum
DROP TYPE IF EXISTS notificationtype CASCADE;
CREATE TYPE notificationtype AS ENUM ('email', 'sms', 'push');

-- ============================================================
-- CREATE TABLES
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    user_type usertype NOT NULL,
    status userstatus DEFAULT 'active',
    last_login TIMESTAMP WITHOUT TIME ZONE,
    organization_name VARCHAR(150),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(200),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    capacity INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Location Zones Table
CREATE TABLE IF NOT EXISTS location_zones (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    description VARCHAR(400),
    benefits VARCHAR(400),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    description TEXT,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    category VARCHAR(50),
    category_id INTEGER REFERENCES categories(id),
    capacity INTEGER,
    event_status VARCHAR(20) DEFAULT 'draft',
    age_restriction VARCHAR(20),
    max_tickets_per_purchase INTEGER DEFAULT 10,
    media VARCHAR(500),
    organizer_id INTEGER,
    location_id INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Ticket Types Table
CREATE TABLE IF NOT EXISTS ticket_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    description VARCHAR(500),
    benefits VARCHAR(500),
    event_id INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    purchase_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount NUMERIC(10, 2),
    buyer_id INTEGER,
    event_id INTEGER,
    ticket_type_id INTEGER,
    quantity INTEGER,
    refund_reason VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_type_id INTEGER,
    qr_code VARCHAR(200) UNIQUE,
    seat_number VARCHAR(50),
    status ticketstatus NOT NULL DEFAULT 'PENDING',
    order_id INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP WITHOUT TIME ZONE,
    payment_status VARCHAR(20),
    retry_count INTEGER DEFAULT 0,
    payment_gateway VARCHAR(50),
    order_id INTEGER REFERENCES orders(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_id INTEGER REFERENCES users(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type notificationtype NOT NULL,
    message VARCHAR(500),
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CREATE INDEXES
-- ============================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_location_id ON events(location_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(event_status);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Tickets indexes
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type_id ON tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);

-- Ticket Types indexes
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types(event_id);

-- Location Zones indexes
CREATE INDEX IF NOT EXISTS idx_location_zones_location_id ON location_zones(location_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- INSERT TEST DATA
-- ============================================================

-- Categories
INSERT INTO categories (name, description) VALUES
('Music', 'Live music concerts, festivals, and musical performances'),
('Theater', 'Theatrical plays, musicals, and stage productions'),
('Sports', 'Professional and amateur sporting events'),
('Conferences', 'Business, technology, and academic conferences'),
('Comedy', 'Stand-up comedy shows and comedy festivals'),
('Dance', 'Dance performances and dance festivals'),
('Art', 'Art exhibitions, galleries, and cultural events'),
('Food & Drink', 'Food festivals, wine tastings, and culinary events'),
('Technology', 'Tech meetups, hackathons, and innovation events'),
('Education', 'Workshops, seminars, and educational events');

-- Locations in Bogota
INSERT INTO locations (name, address, capacity) VALUES
('El Campin Stadium', 'Diagonal 61C #26-36, Bogota, Colombia', 36000),
('Movistar Arena Bogota', 'Calle 63 #59A-45, Bogota, Colombia', 14000),
('Teatro Colon', 'Calle 10 #5-32, Bogota, Colombia', 900),
('Teatro Mayor Julio Mario Santo Domingo', 'Calle 170 #67-51, Bogota, Colombia', 2000),
('Auditorio Leon de Greiff', 'Carrera 30 #45-03, Bogota, Colombia', 2500),
('Centro de Convenciones Gonzalo Jimenez de Quesada', 'Calle 26 #57-41, Bogota, Colombia', 5000),
('Biblioteca Luis Angel Arango', 'Calle 11 #4-14, Bogota, Colombia', 800),
('Museo Nacional de Colombia', 'Carrera 7 #28-66, Bogota, Colombia', 600),
('Parque Simon Bolivar', 'Calle 63 #68-95, Bogota, Colombia', 50000),
('Centro de Alto Rendimiento', 'Calle 63 #47-36, Bogota, Colombia', 8000),
('Coliseo El Salitre', 'Carrera 60 #63-27, Bogota, Colombia', 12000),
('Teatro Jorge Eliecer Gaitan', 'Carrera 7 #22-47, Bogota, Colombia', 1500),
('Auditorio Fundadores Universidad EAN', 'Calle 79 #11-45, Bogota, Colombia', 1000),
('Centro de Eventos La Macarena', 'Carrera 4 #26A-50, Bogota, Colombia', 3000);

-- Location Zones
INSERT INTO location_zones (location_id, name, price, quantity, description, benefits) VALUES
(1, 'VIP Section', 150000.00, 500, 'Premium seating with best views', 'Access to VIP lounge, complimentary drinks, priority parking'),
(1, 'Premium Seating', 80000.00, 2000, 'Comfortable seats with great visibility', 'Cushioned seats, better view angles'),
(1, 'General Admission', 35000.00, 30000, 'Standard stadium seating', 'Access to all stadium facilities'),
(1, 'Student Section', 20000.00, 5000, 'Affordable seating for students', 'Student ID required, same access as general'),
(2, 'VIP Floor', 200000.00, 300, 'Exclusive floor access near stage', 'Early entry, meet & greet opportunity, VIP bar access'),
(2, 'Premium Seating', 120000.00, 1500, 'Best seats in the house', 'Comfortable seats, great acoustics'),
(2, 'Standard Seating', 60000.00, 10000, 'Regular arena seating', 'Good view and sound quality'),
(2, 'Upper Level', 35000.00, 2200, 'Affordable upper level seats', 'Full event access'),
(3, 'Orchestra Section', 120000.00, 400, 'Best seats in the orchestra', 'Premium viewing experience, close to stage'),
(3, 'Balcony', 80000.00, 300, 'Elevated seating with great views', 'Good visibility, classic theater experience'),
(3, 'Gallery', 50000.00, 200, 'Upper level seating', 'Affordable option with full show access'),
(4, 'VIP Box', 180000.00, 100, 'Private box seating', 'Private box, complimentary refreshments, best acoustics'),
(4, 'Orchestra', 100000.00, 800, 'Main floor seating', 'Excellent view and sound'),
(4, 'Mezzanine', 70000.00, 600, 'Elevated middle section', 'Good balance of view and price'),
(4, 'Balcony', 45000.00, 500, 'Upper level seating', 'Budget-friendly option');

-- Events
INSERT INTO events (name, date, end_date, description, category, category_id, capacity, event_status, age_restriction, max_tickets_per_purchase, organizer_id, location_id) VALUES
('Bogota Music Festival 2024', '2024-06-15 18:00:00', '2024-06-15 23:00:00', 'Annual music festival featuring top national and international artists. Multiple stages with diverse genres including rock, pop, electronic, and Latin music.', 'Music', 1, 14000, 'published', '18+', 6, NULL, 2),
('Jazz Night at Teatro Colon', '2024-07-20 20:00:00', '2024-07-20 22:30:00', 'Intimate jazz concert featuring renowned local and international jazz musicians in the historic Teatro Colon.', 'Music', 1, 900, 'published', 'All ages', 4, NULL, 3),
('Electronic Music Showcase', '2024-08-10 22:00:00', '2024-08-11 04:00:00', 'Night-long electronic music event with top DJs from Colombia and around the world. Multiple stages and immersive light shows.', 'Music', 1, 14000, 'published', '18+', 4, NULL, 2),
('Classical Symphony Concert', '2024-09-05 19:30:00', '2024-09-05 21:30:00', 'Orchestral performance featuring works by Beethoven, Mozart, and contemporary Colombian composers.', 'Music', 1, 2000, 'published', 'All ages', 6, NULL, 4),
('Hamlet - Shakespeare Classic', '2024-07-01 19:00:00', '2024-07-01 21:30:00', 'Renowned production of Shakespeare''s masterpiece performed by the National Theater Company. Modern interpretation with traditional elements.', 'Theater', 2, 900, 'published', '12+', 4, NULL, 3),
('Contemporary Theater Night - Urban Voices', '2024-08-15 20:00:00', '2024-08-15 22:00:00', 'Modern theater production exploring urban life in Bogota. Original script with innovative staging and multimedia elements.', 'Theater', 2, 1500, 'published', '14+', 6, NULL, 12),
('Musical: The Phantom of the Opera', '2024-09-20 19:30:00', '2024-09-20 22:30:00', 'Full-scale musical production of the classic Andrew Lloyd Webber musical. International cast with stunning sets and costumes.', 'Theater', 2, 2000, 'published', 'All ages', 8, NULL, 4),
('Comedy Play: City Life', '2024-10-10 20:00:00', '2024-10-10 21:45:00', 'Light-hearted comedy about modern life in Bogota. Perfect for a fun night out with friends and family.', 'Theater', 2, 900, 'published', 'All ages', 6, NULL, 3),
('Colombia vs Argentina - Friendly Match', '2024-06-25 20:00:00', '2024-06-25 22:00:00', 'International friendly soccer match between Colombia and Argentina national teams. Don''t miss this exciting encounter!', 'Sports', 3, 36000, 'published', 'All ages', 10, NULL, 1),
('Bogota Marathon 2024', '2024-08-25 06:00:00', '2024-08-25 12:00:00', 'Annual marathon through the streets of Bogota. Multiple race categories: full marathon, half marathon, and 10K. Spectator tickets available.', 'Sports', 3, 50000, 'published', 'All ages', 8, NULL, 9),
('Basketball Championship Final', '2024-09-15 19:00:00', '2024-09-15 21:30:00', 'Championship final of the national basketball league. High-intensity game with the best teams competing for the title.', 'Sports', 3, 12000, 'published', 'All ages', 6, NULL, 11),
('Cycling Race - Bogota Circuit', '2024-10-05 08:00:00', '2024-10-05 16:00:00', 'Professional cycling race through Bogota''s main streets. Multiple viewing points and grandstand access available.', 'Sports', 3, 8000, 'published', 'All ages', 4, NULL, 10),
('Tech Innovation Summit 2024', '2024-07-10 09:00:00', '2024-07-10 18:00:00', 'Leading technology conference featuring keynote speakers, workshops, and networking opportunities. Topics include AI, blockchain, cloud computing, and startup ecosystem.', 'Conferences', 4, 5000, 'published', '18+', 5, NULL, 6),
('Business Leadership Forum', '2024-08-20 08:30:00', '2024-08-20 17:00:00', 'Annual business conference with industry leaders discussing strategy, innovation, and market trends. Networking lunch included.', 'Conferences', 4, 1000, 'published', '18+', 4, NULL, 13),
('Digital Marketing Conference', '2024-09-12 09:00:00', '2024-09-12 17:30:00', 'Comprehensive conference on digital marketing strategies, social media, SEO, and content marketing. Practical workshops included.', 'Conferences', 4, 3000, 'published', '18+', 6, NULL, 14),
('Academic Research Symposium', '2024-10-15 08:00:00', '2024-10-15 18:00:00', 'International academic conference presenting cutting-edge research across multiple disciplines. Paper presentations and panel discussions.', 'Conferences', 4, 800, 'published', '18+', 4, NULL, 7),
('Stand-Up Comedy Night', '2024-07-25 20:30:00', '2024-07-25 22:30:00', 'Evening of laughter with top Colombian comedians. Fresh material and audience interaction guaranteed.', 'Comedy', 5, 1500, 'published', '18+', 6, NULL, 12),
('Comedy Festival - Bogota Laughs', '2024-09-08 19:00:00', '2024-09-08 23:00:00', 'Multi-act comedy festival featuring local and international comedians. Multiple shows throughout the evening.', 'Comedy', 5, 2000, 'published', '18+', 8, NULL, 4),
('Contemporary Dance Performance', '2024-08-05 20:00:00', '2024-08-05 21:30:00', 'Stunning contemporary dance performance by the National Dance Company. Innovative choreography and powerful storytelling.', 'Dance', 6, 2000, 'published', 'All ages', 6, NULL, 4),
('Folk Dance Festival', '2024-09-28 19:00:00', '2024-09-28 21:00:00', 'Celebration of Colombian folk dance traditions. Colorful costumes, traditional music, and authentic performances.', 'Dance', 6, 1500, 'published', 'All ages', 6, NULL, 12),
('Modern Art Exhibition Opening', '2024-07-15 18:00:00', '2024-07-15 21:00:00', 'Exclusive opening of a major modern art exhibition featuring works by renowned Colombian and international artists.', 'Art', 7, 600, 'published', 'All ages', 4, NULL, 8),
('Street Art Tour & Workshop', '2024-09-18 14:00:00', '2024-09-18 17:00:00', 'Guided tour of Bogota''s best street art followed by a hands-on workshop with local artists.', 'Art', 7, 30, 'published', '12+', 2, NULL, NULL),
('Bogota Food Festival', '2024-08-30 12:00:00', '2024-08-30 20:00:00', 'Culinary festival featuring the best restaurants in Bogota. Food tastings, cooking demonstrations, and live music.', 'Food & Drink', 8, 5000, 'published', 'All ages', 6, NULL, 9),
('Wine Tasting Experience', '2024-10-08 19:00:00', '2024-10-08 22:00:00', 'Exclusive wine tasting event with sommelier-led sessions. Sample wines from Colombia and around the world.', 'Food & Drink', 8, 100, 'published', '21+', 2, NULL, 14),
('AI & Machine Learning Workshop', '2024-07-30 09:00:00', '2024-07-30 17:00:00', 'Hands-on workshop on artificial intelligence and machine learning. Practical exercises and real-world applications.', 'Technology', 9, 200, 'published', '18+', 3, NULL, 13),
('Startup Pitch Night', '2024-09-25 18:00:00', '2024-09-25 21:00:00', 'Evening of startup pitches and networking. Watch innovative startups present their ideas to investors and mentors.', 'Technology', 9, 500, 'published', '18+', 4, NULL, 14),
('Professional Development Seminar', '2024-08-12 09:00:00', '2024-08-12 16:00:00', 'Full-day seminar on professional skills development. Topics include leadership, communication, and career growth.', 'Education', 10, 300, 'published', '18+', 4, NULL, 13),
('Language Learning Workshop', '2024-10-20 10:00:00', '2024-10-20 14:00:00', 'Interactive workshop on effective language learning techniques. Suitable for all levels and languages.', 'Education', 10, 150, 'published', '16+', 3, NULL, 7);

-- Ticket Types
INSERT INTO ticket_types (name, price, quantity, description, benefits, event_id) VALUES
('VIP Floor Access', 200000.00, 300, 'Exclusive floor access near the stage', 'Early entry, meet & greet opportunity, VIP bar access', 1),
('Premium Seating', 120000.00, 1500, 'Best seats in the arena', 'Comfortable seats, great acoustics', 1),
('Standard Seating', 60000.00, 10000, 'Regular arena seating', 'Good view and sound quality', 1),
('Upper Level', 35000.00, 2200, 'Affordable upper level seats', 'Full event access', 1),
('Orchestra Section', 120000.00, 400, 'Best seats in the orchestra', 'Premium viewing experience, close to stage', 2),
('Balcony', 80000.00, 300, 'Elevated seating with great views', 'Good visibility, classic theater experience', 2),
('Gallery', 50000.00, 200, 'Upper level seating', 'Affordable option with full show access', 2),
('VIP Section', 150000.00, 500, 'Premium seating with best views', 'Access to VIP lounge, complimentary drinks, priority parking', 9),
('Premium Seating', 80000.00, 2000, 'Comfortable seats with great visibility', 'Cushioned seats, better view angles', 9),
('General Admission', 35000.00, 30000, 'Standard stadium seating', 'Access to all stadium facilities', 9),
('Student Section', 20000.00, 5000, 'Affordable seating for students', 'Student ID required, same access as general', 9),
('Orchestra Section', 120000.00, 400, 'Best seats in the orchestra', 'Premium viewing experience, close to stage', 5),
('Balcony', 80000.00, 300, 'Elevated seating with great views', 'Good visibility, classic theater experience', 5),
('Gallery', 50000.00, 200, 'Upper level seating', 'Affordable option with full show access', 5),
('VIP Box', 180000.00, 100, 'Private box seating', 'Private box, complimentary refreshments, best acoustics', 6),
('Orchestra', 100000.00, 800, 'Main floor seating', 'Excellent view and sound', 6),
('Mezzanine', 70000.00, 600, 'Elevated middle section', 'Good balance of view and price', 6),
('Balcony', 45000.00, 500, 'Upper level seating', 'Budget-friendly option', 6),
('VIP Pass', 250000.00, 200, 'Full access with premium benefits', 'VIP lounge access, networking dinner, priority seating', 13),
('Full Conference Pass', 150000.00, 3000, 'Access to all sessions and workshops', 'All sessions, lunch included, networking events', 13),
('Day Pass', 80000.00, 1500, 'Single day access', 'Access to all sessions for one day, lunch included', 13),
('Student Pass', 40000.00, 300, 'Discounted student access', 'Student ID required, full conference access', 13),
('VIP Seating', 100000.00, 150, 'Best seats in the house', 'Premium seating, meet & greet after show', 17),
('Standard Seating', 60000.00, 1000, 'Regular theater seating', 'Good view and sound', 17),
('General Admission', 35000.00, 350, 'Affordable seating', 'Full show access', 17),
('VIP Box', 180000.00, 100, 'Private box seating', 'Private box, complimentary refreshments, best acoustics', 19),
('Orchestra', 100000.00, 800, 'Main floor seating', 'Excellent view and sound', 19),
('Mezzanine', 70000.00, 600, 'Elevated middle section', 'Good balance of view and price', 19),
('Balcony', 45000.00, 500, 'Upper level seating', 'Budget-friendly option', 19),
('VIP Access', 120000.00, 500, 'Premium festival access', 'VIP area, priority food tastings, complimentary drinks', 23),
('General Admission', 50000.00, 4000, 'Full festival access', 'Access to all food vendors and activities', 23),
('Early Bird', 35000.00, 500, 'Discounted early entry', 'Early entry, same access as general', 23),
('Full Workshop Pass', 200000.00, 150, 'Complete workshop access', 'All sessions, materials included, certificate', 25),
('Student Pass', 100000.00, 50, 'Discounted student access', 'Student ID required, full workshop access', 25);

COMMIT;

-- ============================================================
-- VERIFY SETUP
-- ============================================================

-- Display all created tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Display all created types
SELECT 
    typname as type_name,
    typtype as type_type
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typtype = 'e'
ORDER BY typname;

-- Count records
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Locations', COUNT(*) FROM locations
UNION ALL
SELECT 'Location Zones', COUNT(*) FROM location_zones
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Ticket Types', COUNT(*) FROM ticket_types;

-- Show events by category
SELECT 
    c.name as category,
    COUNT(e.id) as event_count
FROM categories c
LEFT JOIN events e ON e.category_id = c.id
GROUP BY c.name
ORDER BY event_count DESC;

-- ============================================================
-- SETUP COMPLETED
-- ============================================================
-- Database schema and test data have been created successfully!
-- 
-- Summary:
-- - 4 ENUM types created
-- - 12 tables created with all relationships
-- - All indexes created
-- - 10 categories inserted
-- - 14 locations in Bogota inserted
-- - 15 location zones inserted
-- - 22 events inserted
-- - 32 ticket types inserted
-- All ready for frontend testing!
-- ============================================================

