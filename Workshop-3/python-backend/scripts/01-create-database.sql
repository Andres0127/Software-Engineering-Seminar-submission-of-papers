-- ============================================================
-- EVENT PLATFORM - DATABASE CREATION
-- Step 1: Create the database
-- ============================================================
-- This script creates the PostgreSQL database
-- Run this FIRST before running 02-setup-schema-and-data.sql
-- 
-- Execute:
--   psql -U postgres -f 01-create-database.sql
-- ============================================================

-- Drop database if exists (CAUTION: This will delete all data!)
DROP DATABASE IF EXISTS eventplatform;

-- Create database
-- Using template0 to avoid collation conflicts
CREATE DATABASE eventplatform
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TEMPLATE = template0
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Database created successfully!
-- Next step: Run 02-setup-schema-and-data.sql

