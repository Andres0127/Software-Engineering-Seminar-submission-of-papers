# Sistema de Pagos - Event Platform

## 📋 Descripción General

Sistema profesional de procesamiento de pagos integrado en la plataforma de eventos. Soporta múltiples métodos de pago y proporciona una experiencia realista de compra de tickets.

> **Nota Importante**: Este es un sistema **simulado** para propósitos académicos. No procesa pagos reales ni se conecta a pasarelas de pago reales.

## 🎯 Métodos de Pago Soportados

### 1. Tarjetas de Crédito/Débito 💳
- **Proveedores**: Visa, Mastercard, American Express, Diners Club
- **Características**: 
  - Validación de número de tarjeta (algoritmo Luhn)
  - Verificación de fecha de expiración
  - Validación de CVV
  - Soporte de cuotas (1-48 meses)
  - Tasa de éxito: 95%

**Tarjetas de Prueba**:
```
Visa:       4111 1111 1111 1111
Mastercard: 5500 0000 0000 0004
Amex:       3400 0000 0000 009
Diners:     3600 0000 0000 08
```

### 2. PSE (Pagos Seguros en Línea) 🏦
- **Bancos Soportados**: Bancolombia, Banco de Bogotá, Davivienda, BBVA, y más
- **Características**:
  - Transferencia bancaria directa
  - Validación de documento de identidad
  - Soporte personas naturales y jurídicas
  - Tasa de éxito: 90%

### 3. Billeteras Digitales 📱
- **PayPal** 🅿️: Pago con cuenta PayPal (98% éxito)
- **Nequi** 💜: Pago desde app Nequi (95% éxito)
- **DaviPlata** 🔴: Pago con DaviPlata (95% éxito)
- **Google Pay** 🅶: Pago con Google Pay (98% éxito)

### 4. Pago en Efectivo 💵
- **Redes**: Efecty, Baloto, Su Red
- **Características**:
  - Generación de código de pago
  - Plazo: 24 horas para completar
  - Tasa de éxito: 100% (código generado)

## 🏗️ Arquitectura

### Backend (Python/FastAPI)

```
app/
├── models/
│   └── payment.py          # Modelo de datos ORM
├── schemas/
│   └── payment.py          # Validación Pydantic
├── services/
│   └── payment_service.py  # Lógica de negocio
└── routes/
    └── payments.py         # Endpoints API
```

### Flujo de Pago

```
1. Usuario selecciona tickets → Crea orden (PENDING)
2. Sistema muestra métodos de pago disponibles
3. Usuario selecciona método y proporciona datos
4. Sistema valida datos y simula procesamiento
5. Si éxito: Orden → CONFIRMED, Tickets → CONFIRMED
6. Si fallo: Retorna error con código y mensaje
```

## 🔌 API Endpoints

### GET `/api/payments/methods`
Obtiene lista de métodos de pago disponibles

**Response**:
```json
[
  {
    "code": "credit_card",
    "name": "Tarjeta de Crédito",
    "icon": "💳",
    "description": "Visa, Mastercard, American Express, Diners",
    "processing_time": "Inmediato",
    "fee_percentage": 0.0
  }
]
```

### GET `/api/payments/banks`
Obtiene lista de bancos para PSE

**Response**:
```json
[
  {
    "code": "1007",
    "name": "Bancolombia"
  }
]
```

### POST `/api/payments/process`
Procesa un pago

**Request (Tarjeta de Crédito)**:
```json
{
  "order_id": 123,
  "payment_method": "credit_card",
  "credit_card_data": {
    "card_number": "4111111111111111",
    "card_holder_name": "JUAN PEREZ",
    "expiry_month": "12",
    "expiry_year": "25",
    "cvv": "123",
    "card_type": "credit",
    "installments": 1
  }
}
```

**Request (PSE)**:
```json
{
  "order_id": 123,
  "payment_method": "pse",
  "pse_data": {
    "bank_code": "1007",
    "bank_name": "Bancolombia",
    "person_type": "natural",
    "document_type": "CC",
    "document_number": "1234567890",
    "payer_name": "Juan Perez",
    "payer_email": "juan@example.com"
  }
}
```

**Request (Billetera Digital)**:
```json
{
  "order_id": 123,
  "payment_method": "nequi",
  "digital_wallet_data": {
    "wallet_type": "nequi",
    "phone_number": "3001234567"
  }
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "payment": {
    "id": 456,
    "transaction_id": "TXN-1638360000-ABC12345",
    "payment_status": "completed",
    "authorization_code": "A1B2C3",
    "amount": 150000.00,
    "payment_method": "credit_card",
    "payment_provider": "visa"
  },
  "order_number": "ORD-2025-001",
  "tickets_generated": 2
}
```

**Error Response** (HTTP 402):
```json
{
  "detail": {
    "message": "Fondos insuficientes",
    "error_code": "INSUFFICIENT_FUNDS",
    "transaction_id": "TXN-1638360000-ABC12345"
  }
}
```

### GET `/api/payments/order/{order_id}`
Obtiene pagos de una orden específica

### GET `/api/payments/{payment_id}`
Obtiene detalles de un pago

### GET `/api/payments/history/my-payments`
Obtiene historial de pagos del usuario autenticado

## 🗄️ Modelo de Datos

### Tabla `payments`

```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(100),       -- visa, mastercard, bancolombia, etc.
    payment_gateway VARCHAR(100),        -- nombre del gateway simulado
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    payment_date TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    authorization_code VARCHAR(50),
    payer_name VARCHAR(200),
    payer_email VARCHAR(255),
    payer_document VARCHAR(50),
    payment_details JSONB,               -- Detalles flexibles del pago
    error_code VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Estados de Pago (payment_status)

- `pending`: Pago iniciado pero no procesado
- `processing`: En proceso de validación
- `completed`: Pago exitoso y confirmado
- `failed`: Pago rechazado
- `cancelled`: Pago cancelado por el usuario
- `refunded`: Pago reembolsado

## 🎨 Detalles de Implementación

### Validaciones

1. **Tarjetas**:
   - Número: 13-19 dígitos
   - CVV: 3-4 dígitos
   - Expiración: Validación de fecha futura
   - Detección automática de proveedor (Visa/MC/Amex/Diners)

2. **PSE**:
   - Documento: 5-20 caracteres
   - Tipo de persona: natural/jurídica
   - Email válido (RFC 5322)

3. **Billeteras**:
   - Nequi/Daviplata: Requiere teléfono (10 dígitos)
   - PayPal: Requiere email válido

### Simulación de Procesamiento

```python
SUCCESS_RATES = {
    "credit_card": 0.95,   # 95% de éxito
    "debit_card": 0.95,
    "pse": 0.90,
    "paypal": 0.98,
    "nequi": 0.95,
    "daviplata": 0.95,
    "google_pay": 0.98,
    "cash_payment": 1.0
}
```

### Códigos de Error Comunes

```python
ERROR_CODES = {
    "INSUFFICIENT_FUNDS": "Fondos insuficientes",
    "CARD_EXPIRED": "Tarjeta expirada",
    "INVALID_CVV": "CVV inválido",
    "CARD_DECLINED": "Tarjeta rechazada por el banco",
    "TIMEOUT": "Tiempo de espera agotado",
    "NETWORK_ERROR": "Error de conexión",
    "BANK_UNAVAILABLE": "Banco no disponible en este momento"
}
```

## 🧪 Testing

### Escenarios de Prueba

1. **Pago Exitoso con Tarjeta**:
   - Usar tarjetas de prueba
   - Fecha futura
   - Probabilidad de éxito: 95%

2. **Pago Fallido**:
   - ~5% de las transacciones fallarán aleatoriamente
   - Se retornará un código de error apropiado

3. **Pago PSE**:
   - Seleccionar banco válido
   - Documentos válidos
   - Éxito: 90%

4. **Pago en Efectivo**:
   - Siempre genera código exitosamente
   - Código válido por 24 horas

### Ejemplos de Testing con cURL

```bash
# Obtener métodos de pago
curl http://localhost:8000/api/payments/methods

# Procesar pago con tarjeta
curl -X POST http://localhost:8000/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_id": 1,
    "payment_method": "credit_card",
    "credit_card_data": {
      "card_number": "4111111111111111",
      "card_holder_name": "JUAN PEREZ",
      "expiry_month": "12",
      "expiry_year": "25",
      "cvv": "123",
      "card_type": "credit"
    }
  }'
```

## 📊 Métricas y Monitoreo

El sistema almacena:
- ✅ Todas las transacciones (exitosas y fallidas)
- ✅ Detalles completos en campo JSONB
- ✅ Códigos de autorización
- ✅ Timestamps de cada etapa
- ✅ Información del pagador

## 🔒 Seguridad

**Nota**: En un sistema de producción real, se requeriría:
- Cifrado de datos sensibles
- Tokenización de tarjetas (PCI-DSS)
- Autenticación 3D Secure
- Logs de auditoría
- Rate limiting
- Validación de IP y geolocalización

## 📝 Próximos Pasos

1. ✅ Backend API completado
2. ⏳ Frontend React:
   - Selector de métodos de pago
   - Formularios de pago
   - Pantalla de procesamiento
   - Confirmación de pago
3. ⏳ Testing de integración
4. ⏳ Documentación de usuario final

## 🤝 Contribución

Este es un proyecto académico. Las mejoras sugeridas incluyen:
- Agregar más métodos de pago (Bitcoin, criptomonedas)
- Implementar reembolsos
- Agregar sistema de puntos/descuentos
- Mejorar validaciones de seguridad

---

**Versión**: 1.0.0  
**Fecha**: Noviembre 2025  
**Proyecto**: Workshop 3 - Software Engineering Seminar
