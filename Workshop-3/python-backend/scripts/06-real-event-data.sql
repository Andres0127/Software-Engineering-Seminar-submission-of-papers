BEGIN;

TRUNCATE TABLE tickets, ticket_types, orders, events, categories, locations RESTART IDENTITY CASCADE;

INSERT INTO categories (name, description)
VALUES
  ('Sports', 'Professional and amateur sporting events across multiple disciplines.'),
  ('Theater', 'Live theatrical performances, plays, and stage productions.'),
  ('Concerts', 'Large-scale musical concerts featuring national and international artists.'),
  ('Conferences', 'Academic, business, and professional conferences with expert speakers.'),
  ('Technology', 'Events focused on innovation, AI, and digital transformation.'),
  ('Business', 'Leadership and business development meetings and forums.'),
  ('Music', 'Music events, live performances, and artistic showcases.');

INSERT INTO locations (name, address, capacity)
VALUES
  ('El Campín Stadium', 'Diagonal 61C #26-36, Bogotá, Colombia', 36000),
  ('Movistar Arena Bogotá', 'Cl. 63 #59A-45, Bogotá, Colombia', 14000),
  ('Teatro Colón', 'Calle 10 #5-32, Bogotá, Colombia', 900),
  ('Teatro Mayor Julio Mario Santo Domingo', 'Cll. 170 #67-51, Bogotá, Colombia', 2000),
  ('Corferias Convention Center', 'Av. Carrera 37 #24-67, Bogotá, Colombia', 3000),
  ('Biblioteca Virgilio Barco Auditorium', 'Av. Calle 63 #57-60, Bogotá, Colombia', 650),
  ('Parque Simón Bolívar Plaza', 'Avenida Calle 63, Bogotá, Colombia', 50000);

INSERT INTO events (
  name,
  description,
  date,
  end_date,
  category,
  category_id,
  capacity,
  event_status,
  age_restriction,
  max_tickets_per_purchase,
  organizer_id,
  location_id,
  created_at,
  updated_at
)
VALUES
  -- SPORTS EVENT
  (
    'Bogotá City Marathon 2026',
    'A large-scale marathon bringing together athletes from across Colombia and Latin America.',
    '2026-07-12 06:00:00',
    '2026-07-12 14:00:00',
    'Sports',
    (SELECT id FROM categories WHERE name = 'Sports'),
    36000,
    'published',
    'All Ages',
    6,
    1,
    (SELECT id FROM locations WHERE name = 'El Campín Stadium'),
    NOW(),
    NOW()
  ),
  -- THEATER EVENT
  (
    'Shakespeare in the Andes',
    'A modern theatrical adaptation of Shakespeare, performed by Bogotá’s leading dramatic ensemble.',
    '2026-04-18 19:00:00',
    '2026-04-18 21:30:00',
    'Theater',
    (SELECT id FROM categories WHERE name = 'Theater'),
    900,
    'published',
    '12+',
    4,
    2,
    (SELECT id FROM locations WHERE name = 'Teatro Colón'),
    NOW(),
    NOW()
  ),
  -- CONCERT EVENT
  (
    'Bogotá Live Fest 2026',
    'A massive open-air concert featuring top international pop and rock artists.',
    '2026-09-05 16:00:00',
    '2026-09-05 23:59:00',
    'Concerts',
    (SELECT id FROM categories WHERE name = 'Concerts'),
    50000,
    'published',
    '18+',
    8,
    3,
    (SELECT id FROM locations WHERE name = 'Parque Simón Bolívar Plaza'),
    NOW(),
    NOW()
  ),
  -- CONFERENCE EVENT
  (
    'Latam Leadership & Innovation Conference',
    'A premium conference where executives and thought leaders discuss strategy, growth, and innovation across Latin America.',
    '2026-06-10 09:00:00',
    '2026-06-10 18:00:00',
    'Conferences',
    (SELECT id FROM categories WHERE name = 'Conferences'),
    3000,
    'published',
    '16+',
    5,
    4,
    (SELECT id FROM locations WHERE name = 'Corferias Convention Center'),
    NOW(),
    NOW()
  ),
  -- TECHNOLOGY EVENT
  (
    'Bogotá AI Expo 2026',
    'A major technology exhibition showcasing AI-driven applications and robotics.',
    '2026-03-15 09:00:00',
    '2026-03-15 18:00:00',
    'Technology',
    (SELECT id FROM categories WHERE name = 'Technology'),
    14000,
    'published',
    '16+',
    5,
    5,
    (SELECT id FROM locations WHERE name = 'Movistar Arena Bogotá'),
    NOW(),
    NOW()
  );


INSERT INTO ticket_types (name, price, quantity, description, benefits, event_id)
VALUES
  -- Marathon
  (
    'Runner Kit',
    60.00,
    25000,
    'Includes official shirt, timing chip, and hydration support.',
    'Hydration points, medical support, finisher medal.',
    (SELECT id FROM events WHERE name = 'Bogotá City Marathon 2026')
  ),
  (
    'VIP Marathon Experience',
    120.00,
    1000,
    'Enhanced experience for elite runners.',
    'VIP warm-up area, premium hydration station, exclusive medal.',
    (SELECT id FROM events WHERE name = 'Bogotá City Marathon 2026')
  ),

  -- Theater
  (
    'Regular Seating',
    35.00,
    600,
    'Standard theater seating.',
    'Digital program access.',
    (SELECT id FROM events WHERE name = 'Shakespeare in the Andes')
  ),
  (
    'Premium Seating',
    55.00,
    300,
    'Premium seats with optimal stage view.',
    'Printed program, backstage gallery.',
    (SELECT id FROM events WHERE name = 'Shakespeare in the Andes')
  ),

  -- Concert
  (
    'General Pass',
    99.00,
    30000,
    'Access to all open-air stages.',
    'Festival wristband, digital lineup.',
    (SELECT id FROM events WHERE name = 'Bogotá Live Fest 2026')
  ),
  (
    'Backstage Pass',
    249.00,
    1500,
    'VIP access with backstage experience.',
    'Meet-and-greet, premium viewing area.',
    (SELECT id FROM events WHERE name = 'Bogotá Live Fest 2026')
  ),

  -- Conference
  (
    'Professional Pass',
    180.00,
    2200,
    'Access to all talks and panel sessions.',
    'Conference materials, coffee breaks.',
    (SELECT id FROM events WHERE name = 'Latam Leadership & Innovation Conference')
  ),
  (
    'Executive Pass',
    320.00,
    800,
    'Premium access for executives.',
    'VIP lounge, networking dinner, premium seating.',
    (SELECT id FROM events WHERE name = 'Latam Leadership & Innovation Conference')
  ),

  -- Tech Expo
  (
    'Expo Pass',
    49.00,
    13000,
    'Access to AI exhibition halls and demos.',
    'Digital brochure and workshop materials.',
    (SELECT id FROM events WHERE name = 'Bogotá AI Expo 2026')
  ),
  (
    'Innovation VIP',
    129.00,
    1000,
    'Premium tech expo experience.',
    'VIP zone, curated gift kit, meet-the-exhibitor pass.',
    (SELECT id FROM events WHERE name = 'Bogotá AI Expo 2026')
  );

COMMIT;
