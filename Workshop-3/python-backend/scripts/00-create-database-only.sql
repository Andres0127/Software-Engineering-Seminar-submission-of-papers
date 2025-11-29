-- ============================================================
-- EVENT PLATFORM - POSTGRESQL DATABASE
-- Database Creation Only
-- ============================================================
-- Run this script first to create the database
-- Then run 00-create-complete-database.sql to create the schema
-- ============================================================

-- Drop database if exists (CAUTION: Use only in development)
-- Uncomment the following line if you want to recreate the database
-- DROP DATABASE IF EXISTS eventplatform;

-- Create database
CREATE DATABASE eventplatform
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Database created successfully!
-- Next step: Connect to the database and run 00-create-complete-database.sql
--   psql -U postgres -d eventplatform -f scripts/00-create-complete-database.sql

