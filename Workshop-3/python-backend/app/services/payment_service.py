"""
Servicio de Procesamiento de Pagos Simulado
Este servicio simula el comportamiento de una pasarela de pagos real
para propósitos académicos y de demostración.
"""
import random
import string
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from ..models.payment import Payment, PaymentMethod, PaymentProvider, PaymentStatus
from ..models.order import Order
from ..schemas.payment import (
    PaymentRequest, 
    CreditCardPayment, 
    PSEPayment,
    DigitalWalletPayment,
    CashPaymentRequest
)


class PaymentSimulatorService:
    """Servicio para simular procesamiento de pagos"""
    
    # Configuración de tasas de éxito por método
    # Simulación realista: 90% de éxito para la mayoría de métodos
    SUCCESS_RATES = {
        PaymentMethod.CREDIT_CARD: 0.90,   # 90% de éxito
        PaymentMethod.DEBIT_CARD: 0.90,    # 90% de éxito
        PaymentMethod.PSE: 0.90,           # 90% de éxito
        PaymentMethod.PAYPAL: 0.90,        # 90% de éxito
        PaymentMethod.NEQUI: 0.90,         # 90% de éxito
        PaymentMethod.DAVIPLATA: 0.90,     # 90% de éxito
        PaymentMethod.GOOGLE_PAY: 0.90,    # 90% de éxito
        PaymentMethod.CASH_PAYMENT: 1.0,   # 100% (solo genera código)
    }
    
    # Códigos de respuesta simulados
    ERROR_CODES = {
        "insufficient_funds": "Fondos insuficientes",
        "card_expired": "Tarjeta vencida",
        "invalid_cvv": "CVV inválido",
        "card_blocked": "Tarjeta bloqueada",
        "timeout": "Tiempo de espera excedido",
        "bank_error": "Error en el banco",
        "network_error": "Error de red",
    }
    
    @staticmethod
    def generate_transaction_id() -> str:
        """Genera un ID de transacción único"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return f"TXN-{timestamp}-{random_str}"
    
    @staticmethod
    def generate_authorization_code() -> str:
        """Genera un código de autorización"""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    @staticmethod
    def detect_card_provider(card_number: str) -> str:
        """Detecta el proveedor de la tarjeta basado en el número"""
        # Eliminar espacios y guiones
        card_number = card_number.replace(" ", "").replace("-", "")
        
        # Reglas básicas de detección
        first_digit = card_number[0]
        first_two = card_number[:2]
        first_four = card_number[:4]
        
        if first_digit == "4":
            return PaymentProvider.VISA
        elif first_two in ["51", "52", "53", "54", "55"] or (2221 <= int(first_four) <= 2720):
            return PaymentProvider.MASTERCARD
        elif first_two in ["34", "37"]:
            return PaymentProvider.AMEX
        elif first_two in ["36", "38"] or first_four in ["3095", "3601"]:
            return PaymentProvider.DINERS
        else:
            return "unknown"
    
    @staticmethod
    def validate_card_expiry(month: str, year: str) -> bool:
        """Valida que la tarjeta no esté vencida"""
        current_date = datetime.now()
        expiry_year = 2000 + int(year)  # Asumimos formato YY
        expiry_month = int(month)
        
        if expiry_year < current_date.year:
            return False
        if expiry_year == current_date.year and expiry_month < current_date.month:
            return False
        return True
    
    @classmethod
    def simulate_payment_processing(cls, payment_method: str) -> tuple[bool, Optional[str], Optional[str]]:
        """
        Simula el procesamiento del pago
        Returns: (success, error_code, error_message)
        """
        # Obtener tasa de éxito para este método
        success_rate = cls.SUCCESS_RATES.get(payment_method, 0.90)
        
        # Simular resultado aleatorio
        is_successful = random.random() < success_rate
        
        if is_successful:
            return True, None, None
        else:
            # Seleccionar un error aleatorio
            error_code = random.choice(list(cls.ERROR_CODES.keys()))
            error_message = cls.ERROR_CODES[error_code]
            return False, error_code, error_message
    
    @classmethod
    def process_credit_card_payment(
        cls,
        db: Session,
        order: Order,
        card_data: CreditCardPayment
    ) -> Payment:
        """Procesa un pago con tarjeta de crédito/débito"""
        
        # Validar expiración de tarjeta
        if not cls.validate_card_expiry(card_data.expiry_month, card_data.expiry_year):
            payment = Payment(
                order_id=order.id,
                amount=order.total_amount,
                currency="COP",
                payment_method=PaymentMethod.CREDIT_CARD if card_data.card_type == "credit" else PaymentMethod.DEBIT_CARD,
                transaction_id=cls.generate_transaction_id(),
                payment_status=PaymentStatus.FAILED,
                payment_date=datetime.utcnow(),
                error_code="card_expired",
                error_message="La tarjeta está vencida",
                payment_gateway="simulated"
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)
            return payment
        
        # Detectar proveedor de tarjeta
        provider = cls.detect_card_provider(card_data.card_number)
        
        # Simular procesamiento
        success, error_code, error_message = cls.simulate_payment_processing(
            PaymentMethod.CREDIT_CARD if card_data.card_type == "credit" else PaymentMethod.DEBIT_CARD
        )
        
        # Crear detalles del pago (guardamos solo últimos 4 dígitos)
        last_four = card_data.card_number.replace(" ", "").replace("-", "")[-4:]
        payment_details = {
            "card_last_four": last_four,
            "card_holder": card_data.card_holder_name,
            "card_brand": provider,
            "installments": card_data.installments if card_data.card_type == "credit" else 1,
        }
        
        # Crear registro de pago
        payment = Payment(
            order_id=order.id,
            amount=order.total_amount,
            currency="COP",
            payment_method=PaymentMethod.CREDIT_CARD if card_data.card_type == "credit" else PaymentMethod.DEBIT_CARD,
            payment_provider=provider,
            transaction_id=cls.generate_transaction_id(),
            authorization_code=cls.generate_authorization_code() if success else None,
            payment_status=PaymentStatus.COMPLETED if success else PaymentStatus.FAILED,
            payment_date=datetime.utcnow(),
            completed_at=datetime.utcnow() if success else None,
            payment_details=payment_details,
            payer_name=card_data.card_holder_name,
            error_code=error_code,
            error_message=error_message,
            payment_gateway="simulated"
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
    
    @classmethod
    def process_pse_payment(
        cls,
        db: Session,
        order: Order,
        pse_data: PSEPayment
    ) -> Payment:
        """Procesa un pago con PSE"""
        
        # Simular procesamiento
        success, error_code, error_message = cls.simulate_payment_processing(PaymentMethod.PSE)
        
        # Crear detalles del pago
        payment_details = {
            "bank_name": pse_data.bank_name,
            "bank_code": pse_data.bank_code,
            "person_type": pse_data.person_type,
            "document_type": pse_data.document_type,
            "document_number": pse_data.document_number,
        }
        
        # Crear registro de pago
        payment = Payment(
            order_id=order.id,
            amount=order.total_amount,
            currency="COP",
            payment_method=PaymentMethod.PSE,
            payment_provider=pse_data.bank_name,
            transaction_id=cls.generate_transaction_id(),
            authorization_code=cls.generate_authorization_code() if success else None,
            payment_status=PaymentStatus.COMPLETED if success else PaymentStatus.FAILED,
            payment_date=datetime.utcnow(),
            completed_at=datetime.utcnow() if success else None,
            payment_details=payment_details,
            payer_name=pse_data.payer_name,
            payer_email=pse_data.payer_email,
            payer_document=pse_data.document_number,
            error_code=error_code,
            error_message=error_message,
            payment_gateway="simulated"
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
    
    @classmethod
    def process_digital_wallet_payment(
        cls,
        db: Session,
        order: Order,
        wallet_data: DigitalWalletPayment
    ) -> Payment:
        """Procesa un pago con billetera digital"""
        
        # Mapear tipo de wallet a método
        method_map = {
            'paypal': PaymentMethod.PAYPAL,
            'nequi': PaymentMethod.NEQUI,
            'daviplata': PaymentMethod.DAVIPLATA,
            'google_pay': PaymentMethod.GOOGLE_PAY,
        }
        payment_method = method_map.get(wallet_data.wallet_type, PaymentMethod.PAYPAL)
        
        # Simular procesamiento
        success, error_code, error_message = cls.simulate_payment_processing(payment_method)
        
        # Crear detalles del pago
        payment_details = {
            "wallet_type": wallet_data.wallet_type,
            "phone_number": wallet_data.phone_number if wallet_data.phone_number else None,
            "email": wallet_data.email if wallet_data.email else None,
        }
        
        # Crear registro de pago
        payment = Payment(
            order_id=order.id,
            amount=order.total_amount,
            currency="COP",
            payment_method=payment_method,
            payment_provider=wallet_data.wallet_type,
            transaction_id=cls.generate_transaction_id(),
            authorization_code=cls.generate_authorization_code() if success else None,
            payment_status=PaymentStatus.COMPLETED if success else PaymentStatus.FAILED,
            payment_date=datetime.utcnow(),
            completed_at=datetime.utcnow() if success else None,
            payment_details=payment_details,
            payer_email=wallet_data.email,
            error_code=error_code,
            error_message=error_message,
            payment_gateway="simulated"
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
    
    @classmethod
    def process_cash_payment(
        cls,
        db: Session,
        order: Order,
        cash_data: CashPaymentRequest
    ) -> Payment:
        """Procesa un pago en efectivo (genera código de pago)"""
        
        # Los pagos en efectivo siempre generan un código
        # El usuario debe ir a pagar físicamente
        payment_details = {
            "payment_network": cash_data.payment_network,
            "payment_code": cls.generate_transaction_id(),  # Código para pagar
            "expiry_date": (datetime.utcnow().replace(hour=23, minute=59, second=59)).isoformat(),
            "instructions": f"Paga en cualquier punto {cash_data.payment_network.upper()} con este código"
        }
        
        # Crear registro de pago (estado PENDING hasta que paguen)
        payment = Payment(
            order_id=order.id,
            amount=order.total_amount,
            currency="COP",
            payment_method=PaymentMethod.CASH_PAYMENT,
            payment_provider=cash_data.payment_network,
            transaction_id=cls.generate_transaction_id(),
            payment_status=PaymentStatus.PENDING,  # Pendiente hasta pago en efectivo
            payment_date=datetime.utcnow(),
            payment_details=payment_details,
            payer_name=cash_data.payer_name,
            payer_email=cash_data.payer_email,
            payer_document=cash_data.payer_document,
            payment_gateway="simulated"
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
