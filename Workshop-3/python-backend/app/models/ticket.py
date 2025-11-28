from sqlalchemy import Column, String, Integer, Numeric, text
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from .base import BaseModel

ticket_status_enum = PGEnum(
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    name='ticketstatus',
    create_type=False,
)


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
    status = Column(
        ticket_status_enum,
        nullable=False,
        server_default=text("'PENDING'::ticketstatus"),
    )
    order_id = Column(Integer)
