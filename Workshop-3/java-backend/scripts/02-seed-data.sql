-- ===============================
-- SEED DATA FOR DEVELOPMENT/TESTING
-- ===============================
USE eventplatform_auth;

-- ===============================
-- INSERT PLATFORM ADMIN
-- Password: Admin@123 (BCrypt hash)
-- ===============================
INSERT INTO users (user_type, name, email, phone_number, password, status, permissions, access_level, created_at)
VALUES (
    'PlatformAdmin',
    'System Administrator',
    'admin@eventplatform.com',
    '+57-300-1234567',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    'ALL',
    'SUPER_ADMIN',
    CURRENT_TIMESTAMP
);

-- ===============================
-- INSERT EVENT ORGANIZERS
-- Password: Organizer@123
-- ===============================
INSERT INTO users (user_type, name, email, phone_number, password, status, organization_name, created_at)
VALUES 
(
    'EventOrganizer',
    'Juan Carlos Promotora',
    'juan.organizer@eventplatform.com',
    '+57-310-2345678',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    'Eventos Colombia SAS',
    CURRENT_TIMESTAMP
),
(
    'EventOrganizer',
    'Maria Fernanda Events',
    'maria.organizer@eventplatform.com',
    '+57-320-3456789',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    'MF Producciones Ltda',
    CURRENT_TIMESTAMP
),
(
    'EventOrganizer',
    'Carlos Andres Producciones',
    'carlos.organizer@eventplatform.com',
    '+57-315-4567890',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    'CAP Entertainment',
    CURRENT_TIMESTAMP
);

-- ===============================
-- INSERT TICKET BUYERS
-- Password: Buyer@123
-- ===============================
INSERT INTO users (user_type, name, email, phone_number, password, status, created_at)
VALUES 
(
    'TicketBuyer',
    'Andres Felipe Gomez',
    'andres.buyer@gmail.com',
    '+57-300-5678901',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    CURRENT_TIMESTAMP
),
(
    'TicketBuyer',
    'Laura Camila Rodriguez',
    'laura.buyer@gmail.com',
    '+57-310-6789012',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    CURRENT_TIMESTAMP
),
(
    'TicketBuyer',
    'Daniel Esteban Martinez',
    'daniel.buyer@gmail.com',
    '+57-320-7890123',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    CURRENT_TIMESTAMP
),
(
    'TicketBuyer',
    'Valentina Sofia Lopez',
    'valentina.buyer@gmail.com',
    '+57-315-8901234',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    CURRENT_TIMESTAMP
),
(
    'TicketBuyer',
    'Santiago Jose Hernandez',
    'santiago.buyer@gmail.com',
    '+57-300-9012345',
    '$2a$10$rqYGZEQzXxkQ0JvBqGZ5M.8F6k5xZqY5h5YGQxY5h5YGQxY5h5YGQ',
    'ACTIVE',
    CURRENT_TIMESTAMP
);

-- ===============================
-- INSERT SAMPLE AUDIT LOGS
-- ===============================
INSERT INTO audit_logs (user_id, action, entity, details, ip_address, timestamp)
VALUES 
(
    1,
    'USER_LOGIN',
    'User',
    'Admin user logged in successfully',
    '192.168.1.100',
    CURRENT_TIMESTAMP
),
(
    2,
    'USER_REGISTER',
    'User',
    'New organizer registered',
    '192.168.1.101',
    CURRENT_TIMESTAMP
);

-- ===============================
-- VERIFY INSERTED DATA
-- ===============================
SELECT 
    id,
    user_type,
    name,
    email,
    organization_name,
    status,
    created_at
FROM users
ORDER BY id;

SELECT COUNT(*) as total_users FROM users;
SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type;

-- Show audit logs
SELECT * FROM audit_logs ORDER BY timestamp DESC;
