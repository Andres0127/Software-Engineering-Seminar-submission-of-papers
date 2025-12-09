from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Numeric, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from .base import BaseModel
import os

# Use JSONB for PostgreSQL, JSON for SQLite and other databases
database_url = os.getenv('DATABASE_URL', '')
if database_url.startswith('postgresql'):
    JSONType = JSONB
else:
    JSONType = JSON

class Payment(BaseModel):
    __tablename__ = "payments"
    
    # Relación con orden
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    # Información del pago
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="COP")
    
    # Método de pago
    payment_method = Column(String(50), nullable=False)  # CREDIT_CARD, DEBIT_CARD, PSE, PAYPAL, NEQUI, etc.
    payment_provider = Column(String(50))  # VISA, MASTERCARD, BANCOLOMBIA, etc.
    
    # Información de la transacción
    transaction_id = Column(String(100), unique=True, nullable=False)
    authorization_code = Column(String(50))
    
    # Estado del pago
    payment_status = Column(String(20), default="pending")  # pending, processing, completed, failed, refunded
    
    # Fechas
    payment_date = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Detalles adicionales (JSON para flexibilidad)
    payment_details = Column(JSONType)  # Últimos 4 dígitos, banco, cuotas, etc.
    
    # Información del cliente
    payer_name = Column(String(200))
    payer_email = Column(String(100))
    payer_document = Column(String(50))
    
    # Control de reintentos y errores
    retry_count = Column(Integer, default=0)
    error_message = Column(Text)
    error_code = Column(String(50))
    
    # Gateway simulado (para identificar qué "pasarela" procesó)
    payment_gateway = Column(String(50), default="simulated")

class PaymentMethod:
    """Métodos de pago disponibles"""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PSE = "pse"
    PAYPAL = "paypal"
    NEQUI = "nequi"
    DAVIPLATA = "daviplata"
    GOOGLE_PAY = "google_pay"
    CASH_PAYMENT = "cash_payment"  # Efecty, Baloto, etc.

class PaymentProvider:
    """Proveedores de pago"""
    VISA = "visa"
    MASTERCARD = "mastercard"
    AMEX = "amex"
    DINERS = "diners"
    BANCOLOMBIA = "bancolombia"
    DAVIVIENDA = "davivienda"
    BBVA = "bbva"
    BANCO_BOGOTA = "banco_bogota"
    PAYPAL = "paypal"
    NEQUI = "nequi"
    DAVIPLATA = "daviplata"

class PaymentStatus:
    """Estados de pago"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

