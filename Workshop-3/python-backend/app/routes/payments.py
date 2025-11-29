"""
Rutas de API para procesamiento de pagos
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.order import Order
from ..models.payment import Payment, PaymentStatus
from ..models.ticket import Ticket
from ..schemas.payment import (
    PaymentRequest,
    PaymentResponse,
    PaymentConfirmation,
    PaymentMethodInfo,
    BankInfo
)
from ..services.payment_service import PaymentSimulatorService
from ..services.notification_service import NotificationService
from ..utils.auth import get_current_user_id, require_buyer
from datetime import datetime


router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/methods", response_model=List[PaymentMethodInfo])
async def get_payment_methods():
    """
    Obtiene la lista de métodos de pago disponibles
    """
    methods = [
        PaymentMethodInfo(
            code="credit_card",
            name="Tarjeta de Crédito",
            icon="💳",
            description="Visa, Mastercard, American Express, Diners",
            processing_time="Inmediato",
            fee_percentage=0.0
        ),
        PaymentMethodInfo(
            code="debit_card",
            name="Tarjeta Débito",
            icon="💳",
            description="Visa Débito, Mastercard Débito",
            processing_time="Inmediato",
            fee_percentage=0.0
        ),
        PaymentMethodInfo(
            code="pse",
            name="PSE",
            icon="🏦",
            description="Transferencia bancaria PSE",
            processing_time="Inmediato",
            fee_percentage=0.0
        ),
        PaymentMethodInfo(
            code="paypal",
            name="PayPal",
            icon="🅿️",
            description="Paga con tu cuenta PayPal",
            processing_time="Inmediato",
            fee_percentage=0.0
        ),
        PaymentMethodInfo(
            code="nequi",
            name="Nequi",
            icon="💜",
            description="Paga desde tu app Nequi",
            processing_time="Inmediato",
            fee_percentage=0.0
        ),
        PaymentMethodInfo(
            code="daviplata",
            name="DaviPlata",
            icon="🔴",
            description="Paga con DaviPlata",
            processing_time="Inmediato",
            fee_percentage=0.0
        ),
        PaymentMethodInfo(
            code="google_pay",
            name="Google Pay",
            icon="🅶",
            description="Paga con Google Pay",
            processing_time="Inmediato",
            fee_percentage=0.0
        ),
        PaymentMethodInfo(
            code="cash_payment",
            name="Pago en Efectivo",
            icon="💵",
            description="Efecty, Baloto, Su Red",
            processing_time="Hasta 24 horas",
            fee_percentage=0.0
        ),
    ]
    return methods


@router.get("/banks", response_model=List[BankInfo])
async def get_pse_banks():
    """
    Obtiene la lista de bancos disponibles para PSE
    """
    banks = [
        BankInfo(code="1007", name="Bancolombia"),
        BankInfo(code="1001", name="Banco de Bogotá"),
        BankInfo(code="1023", name="Banco de Occidente"),
        BankInfo(code="1051", name="Davivienda"),
        BankInfo(code="1052", name="Banco AV Villas"),
        BankInfo(code="1013", name="BBVA Colombia"),
        BankInfo(code="1009", name="Citibank"),
        BankInfo(code="1006", name="Banco Itaú"),
        BankInfo(code="1012", name="Banco GNB Sudameris"),
        BankInfo(code="1019", name="Scotiabank Colpatria"),
        BankInfo(code="1507", name="NEQUI"),
        BankInfo(code="1551", name="DaviPlata"),
        BankInfo(code="1062", name="Banco Falabella"),
        BankInfo(code="1059", name="Bancamía"),
        BankInfo(code="1292", name="Banco Cooperativo Coopcentral"),
    ]
    return banks


@router.post("/process", response_model=PaymentConfirmation)
async def process_payment(
    payment_request: PaymentRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Procesa un pago para una orden existente
    """
    # Validar que la orden existe y pertenece al usuario
    order = db.query(Order).filter(
        Order.id == payment_request.order_id,
        Order.buyer_id == current_user_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Orden no encontrada o no pertenece al usuario"
        )
    
    # Validar que la orden esté en estado PENDING
    if order.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"La orden no puede ser pagada. Estado actual: {order.status}"
        )
    
    # Verificar si ya existe un pago exitoso para esta orden
    existing_payment = db.query(Payment).filter(
        Payment.order_id == order.id,
        Payment.payment_status == PaymentStatus.COMPLETED
    ).first()
    
    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Esta orden ya ha sido pagada"
        )
    
    # Procesar según el método de pago
    payment = None
    
    if payment_request.payment_method in ["credit_card", "debit_card"]:
        if not payment_request.credit_card_data:
            raise HTTPException(
                status_code=400,
                detail="Se requieren datos de tarjeta para este método de pago"
            )
        payment = PaymentSimulatorService.process_credit_card_payment(
            db, order, payment_request.credit_card_data
        )
    
    elif payment_request.payment_method == "pse":
        if not payment_request.pse_data:
            raise HTTPException(
                status_code=400,
                detail="Se requieren datos de PSE para este método de pago"
            )
        payment = PaymentSimulatorService.process_pse_payment(
            db, order, payment_request.pse_data
        )
    
    elif payment_request.payment_method in ["paypal", "nequi", "daviplata", "google_pay"]:
        if not payment_request.digital_wallet_data:
            raise HTTPException(
                status_code=400,
                detail="Se requieren datos de billetera digital"
            )
        payment = PaymentSimulatorService.process_digital_wallet_payment(
            db, order, payment_request.digital_wallet_data
        )
    
    elif payment_request.payment_method == "cash_payment":
        if not payment_request.cash_payment_data:
            raise HTTPException(
                status_code=400,
                detail="Se requieren datos para pago en efectivo"
            )
        payment = PaymentSimulatorService.process_cash_payment(
            db, order, payment_request.cash_payment_data
        )
    
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Método de pago no soportado: {payment_request.payment_method}"
        )
    
    # Si el pago fue exitoso, actualizar orden y tickets
    tickets_generated = 0
    if payment.payment_status == PaymentStatus.COMPLETED:
        order.status = "confirmed"
        order.expiration_date = datetime.utcnow()
        
        # Confirmar todos los tickets de esta orden
        tickets = db.query(Ticket).filter(Ticket.order_id == order.id).all()
        for ticket in tickets:
            ticket.status = "CONFIRMED"
            tickets_generated += 1
        
        db.commit()
        db.refresh(order)
        db.refresh(payment)
        
        # Create success notification
        NotificationService.notify_payment_success(db, payment, order)
    
    elif payment.payment_status == PaymentStatus.FAILED:
        # Create failure notification
        NotificationService.notify_payment_failed(db, payment, order)
        
        # Si el pago falló, lanzar excepción con el mensaje de error
        raise HTTPException(
            status_code=402,  # Payment Required
            detail={
                "message": payment.error_message or "El pago no pudo ser procesado",
                "error_code": payment.error_code,
                "transaction_id": payment.transaction_id
            }
        )
    
    # Construir respuesta
    return PaymentConfirmation(
        success=True,
        message="Pago procesado exitosamente",
        payment=PaymentResponse.model_validate(payment),
        order_number=order.order_number,
        tickets_generated=tickets_generated
    )


@router.get("/order/{order_id}", response_model=List[PaymentResponse])
async def get_order_payments(
    order_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Obtiene todos los pagos asociados a una orden
    """
    # Validar que la orden pertenece al usuario
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.buyer_id == current_user_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Orden no encontrada"
        )
    
    # Obtener todos los pagos de la orden
    payments = db.query(Payment).filter(Payment.order_id == order_id).all()
    
    return [PaymentResponse.model_validate(payment) for payment in payments]


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment_details(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Obtiene los detalles de un pago específico
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Pago no encontrado"
        )
    
    # Validar que el pago pertenece a una orden del usuario
    order = db.query(Order).filter(
        Order.id == payment.order_id,
        Order.buyer_id == current_user_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=403,
            detail="No tiene permiso para ver este pago"
        )
    
    return PaymentResponse.model_validate(payment)


@router.get("/history/my-payments", response_model=List[PaymentResponse])
async def get_my_payment_history(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Obtiene el historial de pagos del usuario actual
    """
    # Obtener todas las órdenes del usuario
    orders = db.query(Order).filter(Order.buyer_id == current_user_id).all()
    order_ids = [order.id for order in orders]
    
    # Obtener todos los pagos de esas órdenes
    payments = db.query(Payment).filter(
        Payment.order_id.in_(order_ids)
    ).order_by(Payment.payment_date.desc()).all()
    
    return [PaymentResponse.model_validate(payment) for payment in payments]
