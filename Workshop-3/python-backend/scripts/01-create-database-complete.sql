-- ============================================================
-- EVENT PLATFORM - COMPLETE DATABASE CREATION
-- ============================================================
-- This script creates the complete PostgreSQL database from scratch
-- including all tables, enums, indexes, and initial data
-- 
-- Execute:
--   psql -U postgres -f 01-create-database-complete.sql
-- ============================================================

-- Drop database if exists (CAUTION: This will delete all data!)
DROP DATABASE IF EXISTS eventplatform;

-- Create database
CREATE DATABASE eventplatform
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TEMPLATE = template0
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c eventplatform

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

-- Payment Status Enum
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');

-- ============================================================
-- CREATE TABLES
-- ============================================================

-- Users Table (Note: Users are managed by Java backend, this table is for reference)
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

-- Payments Table (Complete structure with all columns)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(100),
    payment_gateway VARCHAR(100) DEFAULT 'simulated',
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP' NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    authorization_code VARCHAR(50),
    payer_name VARCHAR(200),
    payer_email VARCHAR(255),
    payer_document VARCHAR(50),
    payment_details JSONB,
    retry_count INTEGER DEFAULT 0,
    error_code VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_id INTEGER,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- Notifications Table (Updated structure with title and read_at)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    read_at TIMESTAMP WITHOUT TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    data JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER,
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
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_payer_email ON payments(payer_email);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(payment_provider);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- CREATE TRIGGERS
-- ============================================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to payments table
DROP TRIGGER IF EXISTS trg_update_payments_updated_at ON payments;
CREATE TRIGGER trg_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- ============================================================
-- SETUP COMPLETED
-- ============================================================
-- Database structure has been created successfully!
-- 
-- Summary:
-- - 4 ENUM types created
-- - 12 tables created with all relationships
-- - All indexes created
-- - Triggers created
-- 
-- Next step: Run 02-backup-current-database.sql to populate with data
-- ============================================================

