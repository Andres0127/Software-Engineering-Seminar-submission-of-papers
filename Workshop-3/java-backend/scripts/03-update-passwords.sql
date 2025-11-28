-- ===============================
-- UPDATE PASSWORDS WITH VALID BCRYPT HASHES
-- ===============================
-- This script updates the passwords for seed data users
-- The passwords are: Admin@123, Organizer@123, Buyer@123
-- These hashes were generated using BCryptPasswordEncoder

USE eventplatform_auth;

-- Update Admin password (Admin@123)
-- Hash generated using BCryptPasswordEncoder
UPDATE users 
SET password = '$2a$10$N2zLS7XB3a/w4aTufxXsU.dPUrLgWXISO98rLKNsZ54ZumiCWNUWy'
WHERE email = 'admin@eventplatform.com';

-- Update Organizer passwords (Organizer@123)
-- Hash generated using BCryptPasswordEncoder
UPDATE users 
SET password = '$2a$10$0gCixhSwjLEocegHSn5KJuJ474CrqIFaA.594BHQER/TKIsbu1fGy'
WHERE email IN (
    'juan.organizer@eventplatform.com',
    'maria.organizer@eventplatform.com',
    'carlos.organizer@eventplatform.com'
);

-- Update Buyer passwords (Buyer@123)
-- Hash generated using BCryptPasswordEncoder
UPDATE users 
SET password = '$2a$10$ZqAAWytUIlfwgzhbmGEGKulBXTy2/2BFQtNTzGvzY5niZq/D8g3Om'
WHERE email IN (
    'andres.buyer@gmail.com',
    'laura.buyer@gmail.com',
    'daniel.buyer@gmail.com',
    'valentina.buyer@gmail.com',
    'santiago.buyer@gmail.com'
);

-- Verify updates
SELECT email, LEFT(password, 20) as password_hash_preview FROM users 
WHERE email LIKE '%eventplatform.com' OR email LIKE '%buyer@gmail.com'
ORDER BY email;

