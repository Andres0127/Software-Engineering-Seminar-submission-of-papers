from sqlalchemy import Column, String, Integer, Numeric, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from .base import BaseModel
import enum
import os

class TicketStatus(str, enum.Enum):
    PENDING = 'PENDING'
    CONFIRMED = 'CONFIRMED'
    CANCELLED = 'CANCELLED'

# Use standard Enum for SQLite compatibility, PGEnum for PostgreSQL
# Check DATABASE_URL environment variable or default to SQLEnum for compatibility
database_url = os.getenv('DATABASE_URL', '')
if database_url.startswith('postgresql'):
    ticket_status_enum = PGEnum(
        TicketStatus,
        name='ticketstatus',
        create_type=False,
    )
else:
    # Use standard SQLEnum for SQLite and other databases
    ticket_status_enum = SQLEnum(TicketStatus)


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
        default=TicketStatus.PENDING,
    )
    order_id = Column(Integer)
