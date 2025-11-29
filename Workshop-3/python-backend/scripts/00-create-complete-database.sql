-- ============================================================
-- EVENT PLATFORM - POSTGRESQL DATABASE
-- Complete Database Creation Script
-- ============================================================
-- This script creates the entire database schema from scratch
-- Run this script once to set up the database for all collaborators
-- 
-- IMPORTANT: Make sure you are connected to the 'eventplatform' database
-- before running this script. If the database doesn't exist, create it first:
--   CREATE DATABASE eventplatform;
-- Then connect: \c eventplatform
-- ============================================================

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
-- VERIFY CREATION
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

-- ============================================================
-- SCRIPT COMPLETED
-- ============================================================
-- Database 'eventplatform' has been created successfully!
-- All tables, enums, and indexes are ready to use.
-- ============================================================

