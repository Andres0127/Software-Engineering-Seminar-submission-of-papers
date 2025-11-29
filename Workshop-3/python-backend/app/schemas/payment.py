from pydantic import BaseModel, Field, EmailStr, validator, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal


class PaymentMethodInfo(BaseModel):
    """Información de un método de pago disponible"""
    code: str
    name: str
    icon: str
    description: str
    processing_time: str
    fee_percentage: float


class BankInfo(BaseModel):
    """Información de un banco para PSE"""
    code: str
    name: str


class CreditCardPayment(BaseModel):
    """Datos para pago con tarjeta de crédito/débito"""
    card_number: str = Field(..., min_length=13, max_length=19)
    card_holder_name: str = Field(..., min_length=3, max_length=200)
    expiry_month: str = Field(..., pattern=r"^(0[1-9]|1[0-2])$")
    expiry_year: str = Field(..., pattern=r"^\d{2}$")
    cvv: str = Field(..., min_length=3, max_length=4)
    card_type: str = Field(..., description="credit or debit")
    installments: Optional[int] = Field(1, ge=1, le=48, description="Número de cuotas (solo crédito)")
    
    @validator('card_number')
    def validate_card_number(cls, v):
        # Eliminar espacios
        v = v.replace(" ", "").replace("-", "")
        if not v.isdigit():
            raise ValueError("El número de tarjeta debe contener solo dígitos")
        if len(v) < 13 or len(v) > 19:
            raise ValueError("Número de tarjeta inválido")
        return v
    
    @validator('card_type')
    def validate_card_type(cls, v):
        if v.lower() not in ['credit', 'debit']:
            raise ValueError("Tipo de tarjeta debe ser 'credit' o 'debit'")
        return v.lower()


class PSEPayment(BaseModel):
    """Datos para pago con PSE"""
    bank_code: str = Field(..., description="Código del banco")
    bank_name: str = Field(..., description="Nombre del banco")
    person_type: str = Field(..., description="natural o juridica")
    document_type: str = Field(..., description="CC, CE, NIT, etc.")
    document_number: str = Field(..., min_length=5, max_length=20)
    payer_name: str = Field(..., min_length=3, max_length=200)
    payer_email: EmailStr
    
    @validator('person_type')
    def validate_person_type(cls, v):
        if v.lower() not in ['natural', 'juridica']:
            raise ValueError("Tipo de persona debe ser 'natural' o 'juridica'")
        return v.lower()


class DigitalWalletPayment(BaseModel):
    """Datos para pago con billetera digital"""
    wallet_type: str = Field(..., description="paypal, nequi, daviplata, google_pay")
    phone_number: Optional[str] = Field(None, description="Para Nequi/Daviplata")
    email: Optional[EmailStr] = Field(None, description="Para PayPal")
    
    @validator('wallet_type')
    def validate_wallet_type(cls, v):
        valid_wallets = ['paypal', 'nequi', 'daviplata', 'google_pay']
        if v.lower() not in valid_wallets:
            raise ValueError(f"Billetera debe ser una de: {', '.join(valid_wallets)}")
        return v.lower()


class CashPaymentRequest(BaseModel):
    """Datos para pago en efectivo"""
    payment_network: str = Field(..., description="efecty, baloto, su_red")
    payer_name: str = Field(..., min_length=3, max_length=200)
    payer_document: str = Field(..., min_length=5, max_length=20)
    payer_email: EmailStr
    
    @validator('payment_network')
    def validate_network(cls, v):
        valid_networks = ['efecty', 'baloto', 'su_red']
        if v.lower() not in valid_networks:
            raise ValueError(f"Red de pago debe ser una de: {', '.join(valid_networks)}")
        return v.lower()


class PaymentRequest(BaseModel):
    """Request principal para procesar un pago"""
    order_id: int = Field(..., description="ID de la orden a pagar")
    payment_method: str = Field(..., description="Método de pago seleccionado")
    
    # Datos específicos según el método (opcionales)
    credit_card_data: Optional[CreditCardPayment] = None
    pse_data: Optional[PSEPayment] = None
    digital_wallet_data: Optional[DigitalWalletPayment] = None
    cash_payment_data: Optional[CashPaymentRequest] = None
    
    @validator('payment_method')
    def validate_payment_method(cls, v):
        valid_methods = [
            'credit_card', 'debit_card', 'pse', 'paypal', 
            'nequi', 'daviplata', 'google_pay', 'cash_payment'
        ]
        if v.lower() not in valid_methods:
            raise ValueError(f"Método de pago inválido. Use uno de: {', '.join(valid_methods)}")
        return v.lower()


class PaymentResponse(BaseModel):
    """Respuesta del procesamiento de pago"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    order_id: int
    transaction_id: str
    payment_status: str
    payment_method: str
    payment_provider: Optional[str]
    amount: float
    currency: str
    payment_date: datetime
    authorization_code: Optional[str]
    payment_details: Optional[Dict[str, Any]]


class PaymentConfirmation(BaseModel):
    """Confirmación de pago exitoso"""
    success: bool
    message: str
    payment: PaymentResponse
    order_number: str
    tickets_generated: int
