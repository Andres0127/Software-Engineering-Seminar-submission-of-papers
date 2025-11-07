from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum, Numeric
from .base import BaseModel

class Order(BaseModel):
    __tablename__ = "orders"
    
    order_number = Column(String(50), unique=True, nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    expiration_date = Column(DateTime)
    status = Column(String(20), default="pending")
    total_amount = Column(Numeric(10, 2))
    buyer_id = Column(Integer)
