BEGIN;

ALTER TABLE tickets ALTER COLUMN status TYPE TEXT;

UPDATE tickets
SET status = CASE
  WHEN status ILIKE 'valid' THEN 'PENDING'
  WHEN status ILIKE 'used' THEN 'CONFIRMED'
  WHEN status ILIKE 'cancelled' THEN 'CANCELLED'
  ELSE UPPER(status)
END;

DROP TYPE IF EXISTS ticketstatus;

CREATE TYPE ticketstatus AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

ALTER TABLE tickets ALTER COLUMN status TYPE ticketstatus USING status::ticketstatus;

COMMIT;

