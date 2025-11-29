# Database Setup Guide

## Quick Start - Complete Database Creation

### Two SQL Scripts (Simple and Recommended)

**Two scripts for easy setup:**

1. **`01-create-database.sql`** - Creates the database
2. **`02-setup-schema-and-data.sql`** - Creates schema, tables, and inserts test data

**Execute in order:**

```powershell
# Windows (PowerShell)
# Step 1: Create database
cd Workshop-3/python-backend/scripts
psql -U postgres -f 01-create-database.sql

# Step 2: Create schema and data
psql -U postgres -d eventplatform -f 02-setup-schema-and-data.sql
```

```bash
# Linux/macOS
# Step 1: Create database
cd Workshop-3/python-backend/scripts
psql -U postgres -f 01-create-database.sql

# Step 2: Create schema and data
psql -U postgres -d eventplatform -f 02-setup-schema-and-data.sql
```

**What's included:**
- Database creation
- All ENUM types (ticketstatus, usertype, userstatus, notificationtype)
- All 12 tables with relationships
- All indexes
- Test data (10 categories, 14 locations, 22 events, 32 ticket types)

### Scripts Overview

**`01-create-database.sql`** - Creates the database:
- Drops existing database if it exists
- Creates new `eventplatform` database
- Uses `template0` to avoid collation conflicts

**`02-setup-schema-and-data.sql`** - Creates everything else:
1. ✅ Creates all ENUM types
2. ✅ Creates all 12 tables with complete schema
3. ✅ Creates all indexes for optimal performance
4. ✅ Sets up all foreign key relationships
5. ✅ Inserts all test data (categories, locations, events, ticket types)

### Important Notes

- **Run scripts in order:** First `01-create-database.sql`, then `02-setup-schema-and-data.sql`
- **Database will be dropped:** The first script will delete the existing database if it exists
- **All data in English:** Test data is in English for frontend testing
- **No special characters:** Addresses use ASCII characters only to avoid encoding issues

### Verification

After running both scripts, verify the setup:

```sql
-- Connect to the database
psql -U postgres -d eventplatform

-- Check tables
\dt

-- Check types
\dT

-- Count records
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Locations', COUNT(*) FROM locations
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Ticket Types', COUNT(*) FROM ticket_types;
```

Expected results:
- Categories: 10
- Locations: 14
- Events: 22
- Ticket Types: 32

### Troubleshooting

**Error: "database already exists"**
- The first script will drop and recreate it. This is normal.

**Error: "permission denied"**
- Make sure you're using a PostgreSQL superuser account (usually `postgres`).

**Error: "no existe el tipo ticketstatus"**
- Make sure you ran `02-setup-schema-and-data.sql` after creating the database.

**Error: "character encoding"**
- The scripts use ASCII characters only. If you see encoding errors, make sure your PostgreSQL client is set to UTF-8.

### Database Connection

Default connection settings (adjust in `app/core/config.py` if needed):
- **Host**: localhost
- **Port**: 5432
- **Database**: eventplatform
- **User**: postgres
- **Password**: (your PostgreSQL password)
