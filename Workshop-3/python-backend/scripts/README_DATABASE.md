# Database Setup Guide

## Quick Start - Complete Database Creation

For new collaborators or fresh installations, use the **complete database creation script**:

### Single Script Setup (Recommended)

**Step 1: Create the database**

```bash
# Windows (PowerShell)
psql -U postgres -f scripts/00-create-database-only.sql

# Linux/macOS
psql -U postgres -f scripts/00-create-database-only.sql
```

**Step 2: Create all tables and schema**

```bash
# Windows (PowerShell)
psql -U postgres -d eventplatform -f scripts/00-create-complete-database.sql

# Linux/macOS
psql -U postgres -d eventplatform -f scripts/00-create-complete-database.sql
```

**Alternative: All in one command**

```bash
# Windows (PowerShell)
psql -U postgres -c "CREATE DATABASE eventplatform;" && psql -U postgres -d eventplatform -f scripts/00-create-complete-database.sql

# Linux/macOS
psql -U postgres -c "CREATE DATABASE eventplatform;" && psql -U postgres -d eventplatform -f scripts/00-create-complete-database.sql
```

**Or connect to PostgreSQL interactively:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
\i scripts/00-create-database-only.sql

# Connect to the new database
\c eventplatform

# Create all tables
\i scripts/00-create-complete-database.sql
```

### What the Script Does

The `00-create-complete-database.sql` script:

1. ✅ Creates the `eventplatform` database
2. ✅ Creates all ENUM types:
   - `ticketstatus` (PENDING, CONFIRMED, CANCELLED)
   - `usertype` (admin, organizer, buyer)
   - `userstatus` (active, inactive, suspended)
   - `notificationtype` (email, sms, push)
3. ✅ Creates all tables with complete schema:
   - users
   - categories
   - locations
   - location_zones
   - events
   - ticket_types
   - orders
   - tickets
   - payments
   - reviews
   - notifications
   - audit_logs
4. ✅ Creates all indexes for optimal performance
5. ✅ Sets up all foreign key relationships

### Important Notes

- **This script replaces all previous migration scripts** (04, 05, 08, 09, 10)
- **Use this script for new installations only**
- **If you already have data**, use the individual migration scripts instead
- The script will **drop and recreate** the database if you uncomment the DROP statement

### For Existing Databases

If you already have a database with existing data that needs to be migrated, you'll need to manually apply the schema changes. The migration scripts have been consolidated into the complete database script. For production migrations, consider:

1. Creating a backup of your existing database
2. Reviewing the `00-create-complete-database.sql` script to identify the changes needed
3. Applying changes incrementally to preserve existing data

### Verification

After running the script, verify the database was created correctly:

```sql
-- Connect to the database
\c eventplatform

-- List all tables
\dt

-- List all types
\dT

-- Check a specific table structure
\d events
```

### Troubleshooting

**Error: "database already exists"**
- The database already exists. Either drop it first or use a different database name.

**Error: "permission denied"**
- Make sure you're using a PostgreSQL superuser account (usually `postgres`).

**Error: "relation already exists"**
- Some tables already exist. Drop the database first or use migration scripts instead.

### Database Connection

Default connection settings (adjust in `app/core/config.py` if needed):
- **Host**: localhost
- **Port**: 5432
- **Database**: eventplatform
- **User**: postgres
- **Password**: (your PostgreSQL password)

