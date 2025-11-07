from sqlalchemy import Column, String, Integer, Numeric
from .base import BaseModel

class TicketType(BaseModel):
    __tablename__ = "ticket_types"
    
    name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    description = Column(String(500))
    benefits = Column(String(500))
    event_id = Column(Integer)

class Ticket(BaseModel):
    __tablename__ = "tickets"
    
    ticket_type_id = Column(Integer)
    qr_code = Column(String(200), unique=True)
    seat_number = Column(String(50))
    status = Column(String(20), default="valid")
    order_id = Column(Integer)
