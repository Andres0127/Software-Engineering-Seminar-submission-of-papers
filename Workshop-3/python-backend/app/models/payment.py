from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Numeric
from .base import BaseModel

class Payment(BaseModel):
    __tablename__ = "payments"
    
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50))
    transaction_id = Column(String(100))
    payment_date = Column(DateTime)
    payment_status = Column(String(20))
    retry_count = Column(Integer, default=0)
    payment_gateway = Column(String(50))
    order_id = Column(Integer, ForeignKey("orders.id"))

class PaymentStatus:
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
