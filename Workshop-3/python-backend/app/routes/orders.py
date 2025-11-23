from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..schemas.order import OrderCreate, OrderResponse
from ..models.order import Order
from ..models.ticket import TicketType
from ..utils.auth import require_auth, get_current_user_id
import uuid
from datetime import datetime
from decimal import Decimal

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse)
async def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
    payload: dict = Depends(require_auth)
):
    """
    Create a new order and calculate total amount based on ticket type price and quantity.
    """
    try:
        # Get ticket type to calculate total
        ticket_type = db.query(TicketType).filter(TicketType.id == order.ticket_type_id).first()
        if not ticket_type:
            raise HTTPException(status_code=404, detail="Ticket type not found")
        
        # Calculate total amount: price * quantity
        total_amount = Decimal(str(ticket_type.price)) * Decimal(str(order.quantity))
        
        # Generate order number
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        # Get buyer_id from JWT token
        buyer_id = current_user_id
        
        db_order = Order(
            order_number=order_number,
            purchase_date=datetime.utcnow(),
            status="pending",
            total_amount=total_amount,
            buyer_id=buyer_id,
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/", response_model=List[OrderResponse])
async def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders


