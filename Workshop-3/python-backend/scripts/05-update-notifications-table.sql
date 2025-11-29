-- Script to update notifications table with new columns
-- This migration adds additional fields to the notifications table

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add title column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN title VARCHAR(200);
        
        -- Set default title for existing notifications
        UPDATE notifications 
        SET title = 'Notification'
        WHERE title IS NULL;
        
        -- Make it NOT NULL after setting defaults
        ALTER TABLE notifications 
        ALTER COLUMN title SET NOT NULL;
        
        RAISE NOTICE 'Column title added successfully';
    ELSE
        RAISE NOTICE 'Column title already exists';
    END IF;
    
    -- Change type column from enum to varchar
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'type'
        AND data_type != 'character varying'
    ) THEN
        -- Drop the constraint first
        ALTER TABLE notifications 
        ALTER COLUMN type TYPE VARCHAR(50);
        
        RAISE NOTICE 'Column type changed to VARCHAR';
    ELSE
        RAISE NOTICE 'Column type is already VARCHAR or does not exist';
    END IF;
    
    -- Change message to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'message'
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE notifications 
        ALTER COLUMN message TYPE TEXT;
        
        RAISE NOTICE 'Column message changed to TEXT';
    ELSE
        RAISE NOTICE 'Column message is already TEXT';
    END IF;
    
    -- Add related_entity_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'related_entity_type'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN related_entity_type VARCHAR(50);
        
        RAISE NOTICE 'Column related_entity_type added successfully';
    ELSE
        RAISE NOTICE 'Column related_entity_type already exists';
    END IF;
    
    -- Add related_entity_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'related_entity_id'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN related_entity_id INTEGER;
        
        RAISE NOTICE 'Column related_entity_id added successfully';
    ELSE
        RAISE NOTICE 'Column related_entity_id already exists';
    END IF;
    
    -- Add data column (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'data'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN data JSONB;
        
        RAISE NOTICE 'Column data added successfully';
    ELSE
        RAISE NOTICE 'Column data already exists';
    END IF;
    
    -- Add read_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read_at'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN read_at TIMESTAMP;
        
        RAISE NOTICE 'Column read_at added successfully';
    ELSE
        RAISE NOTICE 'Column read_at already exists';
    END IF;
    
    -- Remove sent_at column if it exists (not used anymore)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE notifications 
        DROP COLUMN sent_at;
        
        RAISE NOTICE 'Column sent_at removed';
    ELSE
        RAISE NOTICE 'Column sent_at does not exist';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);

-- Verify the structure
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

SELECT 'Notifications table migration completed successfully' AS resultado;
