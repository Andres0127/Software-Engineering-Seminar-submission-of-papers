from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..schemas.order import OrderCreate, OrderResponse
from ..models.order import Order
import uuid
from datetime import datetime
from decimal import Decimal

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    try:
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        db_order = Order(
            order_number=order_number,
            purchase_date=datetime.utcnow(),
            status="pending",
            total_amount=Decimal("0.00"),
            buyer_id=1,  # TODO: Get from JWT token
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
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


