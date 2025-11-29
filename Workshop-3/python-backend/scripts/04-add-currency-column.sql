-- Script para agregar la columna currency a la tabla payments
-- Esta columna faltaba en la creación original de la tabla

-- Agregar columna currency si no existe
DO $$ 
BEGIN
    -- Intentar agregar la columna currency
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE payments 
        ADD COLUMN currency VARCHAR(3) DEFAULT 'COP' NOT NULL;
        
        RAISE NOTICE 'Columna currency agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna currency ya existe';
    END IF;
END $$;

-- Verificar la estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Verificar que la columna tenga el valor por defecto en registros existentes
UPDATE payments 
SET currency = 'COP' 
WHERE currency IS NULL;

SELECT 'Migración completada exitosamente' AS resultado;
