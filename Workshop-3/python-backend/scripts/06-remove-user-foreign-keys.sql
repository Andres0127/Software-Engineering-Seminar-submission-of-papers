-- Script to remove foreign key constraints that reference the users table
-- The users are managed by the Java backend (MySQL), not in this PostgreSQL database
-- This makes notifications.user_id work like orders.buyer_id (just an INTEGER without FK)

-- Remove foreign key constraint from notifications table
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'notifications' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id';
    
    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE notifications DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Foreign key constraint % removed from notifications table', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on notifications.user_id';
    END IF;
END $$;

-- Verify the constraint has been removed
SELECT 
    'notifications' as table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'notifications'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id';

-- If the query above returns no rows, the FK has been successfully removed

SELECT 'Foreign key constraint removed. notifications.user_id now works like orders.buyer_id (stores Java backend user IDs)' AS resultado;
