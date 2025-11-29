-- Script de migración para agregar columnas faltantes a la tabla payments
-- Ejecutar si la tabla payments ya existe pero le faltan columnas

-- Agregar columnas si no existen
DO $$ 
BEGIN
    -- payment_provider
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='payment_provider') THEN
        ALTER TABLE payments ADD COLUMN payment_provider VARCHAR(100);
        RAISE NOTICE 'Columna payment_provider agregada';
    END IF;

    -- payment_gateway
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='payment_gateway') THEN
        ALTER TABLE payments ADD COLUMN payment_gateway VARCHAR(100);
        RAISE NOTICE 'Columna payment_gateway agregada';
    END IF;

    -- completed_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='completed_at') THEN
        ALTER TABLE payments ADD COLUMN completed_at TIMESTAMP;
        RAISE NOTICE 'Columna completed_at agregada';
    END IF;

    -- authorization_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='authorization_code') THEN
        ALTER TABLE payments ADD COLUMN authorization_code VARCHAR(50);
        RAISE NOTICE 'Columna authorization_code agregada';
    END IF;

    -- payer_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='payer_name') THEN
        ALTER TABLE payments ADD COLUMN payer_name VARCHAR(200);
        RAISE NOTICE 'Columna payer_name agregada';
    END IF;

    -- payer_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='payer_email') THEN
        ALTER TABLE payments ADD COLUMN payer_email VARCHAR(255);
        RAISE NOTICE 'Columna payer_email agregada';
    END IF;

    -- payer_document
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='payer_document') THEN
        ALTER TABLE payments ADD COLUMN payer_document VARCHAR(50);
        RAISE NOTICE 'Columna payer_document agregada';
    END IF;

    -- payment_details (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='payment_details') THEN
        ALTER TABLE payments ADD COLUMN payment_details JSONB;
        RAISE NOTICE 'Columna payment_details agregada';
    END IF;

    -- error_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='error_code') THEN
        ALTER TABLE payments ADD COLUMN error_code VARCHAR(50);
        RAISE NOTICE 'Columna error_code agregada';
    END IF;

    -- error_message
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='error_message') THEN
        ALTER TABLE payments ADD COLUMN error_message TEXT;
        RAISE NOTICE 'Columna error_message agregada';
    END IF;

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='updated_at') THEN
        ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Columna updated_at agregada';
    END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_payments_payer_email ON payments(payer_email);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(payment_provider);

-- Agregar comentarios
COMMENT ON COLUMN payments.payment_provider IS 'Proveedor específico: visa, mastercard, amex, nombre del banco, etc.';
COMMENT ON COLUMN payments.payment_details IS 'Detalles adicionales del pago en formato JSON';
COMMENT ON COLUMN payments.authorization_code IS 'Código de autorización del procesador de pagos';

-- Verificar estructura actualizada
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;
