-- Script para agregar la tabla de pagos
-- Ejecutar después de tener las tablas base creadas

-- Crear tipo ENUM para estado de pago si no existe
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(100),
    payment_gateway VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP' NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    authorization_code VARCHAR(50),
    payer_name VARCHAR(200),
    payer_email VARCHAR(255),
    payer_document VARCHAR(50),
    payment_details JSONB,
    error_code VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_payer_email ON payments(payer_email);

-- Agregar trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_payments_updated_at ON payments;
CREATE TRIGGER trg_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- Comentarios de documentación
COMMENT ON TABLE payments IS 'Tabla de pagos procesados para órdenes de tickets';
COMMENT ON COLUMN payments.transaction_id IS 'ID único de transacción generado por el sistema';
COMMENT ON COLUMN payments.payment_method IS 'Método de pago usado: credit_card, debit_card, pse, paypal, nequi, daviplata, google_pay, cash_payment';
COMMENT ON COLUMN payments.payment_provider IS 'Proveedor específico: visa, mastercard, amex, nombre del banco, etc.';
COMMENT ON COLUMN payments.payment_details IS 'Detalles adicionales del pago en formato JSON';
COMMENT ON COLUMN payments.authorization_code IS 'Código de autorización del procesador de pagos';

-- Verificar creación
SELECT 'Tabla payments creada exitosamente' AS resultado;
SELECT COUNT(*) AS total_payments FROM payments;
