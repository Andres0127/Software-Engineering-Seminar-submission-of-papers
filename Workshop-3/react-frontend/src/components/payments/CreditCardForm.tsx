import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Info } from 'lucide-react';
import { CreditCardData } from '../../services/paymentService';
import './CreditCardForm.css';

interface CreditCardFormProps {
  onSubmit: (data: CreditCardData) => void;
  onBack: () => void;
  isProcessing: boolean;
  orderAmount: number;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  onSubmit,
  onBack,
  isProcessing,
  orderAmount,
}) => {
  const [cardData, setCardData] = useState<CreditCardData>({
    card_number: '',
    card_holder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    card_type: 'credit',
    installments: 1,
  });

  const [cardBrand, setCardBrand] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    detectCardBrand(cardData.card_number);
  }, [cardData.card_number]);

  const detectCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) {
      setCardBrand('visa');
    } else if (/^5[1-5]/.test(cleanNumber)) {
      setCardBrand('mastercard');
    } else if (/^3[47]/.test(cleanNumber)) {
      setCardBrand('amex');
    } else if (/^36/.test(cleanNumber)) {
      setCardBrand('diners');
    } else {
      setCardBrand('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar número de tarjeta
    const cleanNumber = cardData.card_number.replace(/\s/g, '');
    if (!cleanNumber || cleanNumber.length < 13 || cleanNumber.length > 19) {
      newErrors.card_number = 'Número de tarjeta inválido';
    }

    // Validar titular
    if (!cardData.card_holder_name || cardData.card_holder_name.length < 3) {
      newErrors.card_holder_name = 'Nombre del titular requerido';
    }

    // Validar expiración
    if (!cardData.expiry_month || !cardData.expiry_year) {
      newErrors.expiry = 'Fecha de expiración requerida';
    } else {
      const month = parseInt(cardData.expiry_month);
      const year = parseInt('20' + cardData.expiry_year);
      const now = new Date();
      const expiry = new Date(year, month - 1);
      if (expiry < now) {
        newErrors.expiry = 'Tarjeta expirada';
      }
    }

    // Validar CVV
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(cardData);
    }
  };

  const handleChange = (field: keyof CreditCardData, value: any) => {
    setCardData({ ...cardData, [field]: value });
    // Limpiar error del campo
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const getCardBrandLogo = () => {
    switch (cardBrand) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 American Express';
      case 'diners':
        return '💳 Diners Club';
      default:
        return '';
    }
  };

  const installmentOptions = [1, 2, 3, 6, 9, 12, 18, 24, 36, 48];
  const installmentAmount = orderAmount / (cardData.installments || 1);

  return (
    <div className="credit-card-form-container">
      <button className="back-button" onClick={onBack} disabled={isProcessing}>
        ← Volver a métodos de pago
      </button>

      <div className="card-form-header">
        <CreditCard className="header-icon" />
        <div>
          <h2>Pago con Tarjeta</h2>
          <p className="header-subtitle">
            Ingresa los datos de tu tarjeta de crédito o débito
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="credit-card-form">
        {/* Visualización de tarjeta */}
        <div className="card-preview">
          <div className={`card-visual ${cardBrand}`}>
            <div className="card-chip"></div>
            <div className="card-number">
              {cardData.card_number || '•••• •••• •••• ••••'}
            </div>
            <div className="card-details">
              <div className="card-holder">
                <div className="card-label">TITULAR</div>
                <div className="card-value">
                  {cardData.card_holder_name || 'NOMBRE APELLIDO'}
                </div>
              </div>
              <div className="card-expiry">
                <div className="card-label">EXPIRA</div>
                <div className="card-value">
                  {cardData.expiry_month && cardData.expiry_year
                    ? `${cardData.expiry_month}/${cardData.expiry_year}`
                    : 'MM/AA'}
                </div>
              </div>
            </div>
            {cardBrand && (
              <div className="card-brand">{getCardBrandLogo()}</div>
            )}
          </div>
        </div>

        {/* Tipo de tarjeta */}
        <div className="form-group">
          <label className="form-label">Tipo de tarjeta</label>
          <div className="card-type-selector">
            <button
              type="button"
              className={`card-type-btn ${
                cardData.card_type === 'credit' ? 'active' : ''
              }`}
              onClick={() => handleChange('card_type', 'credit')}
            >
              💳 Crédito
            </button>
            <button
              type="button"
              className={`card-type-btn ${
                cardData.card_type === 'debit' ? 'active' : ''
              }`}
              onClick={() => handleChange('card_type', 'debit')}
            >
              💳 Débito
            </button>
          </div>
        </div>

        {/* Número de tarjeta */}
        <div className="form-group">
          <label className="form-label">
            Número de tarjeta
            {cardBrand && <span className="detected-brand">{getCardBrandLogo()}</span>}
          </label>
          <input
            type="text"
            className={`form-input ${errors.card_number ? 'error' : ''}`}
            placeholder="1234 5678 9012 3456"
            value={cardData.card_number}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '');
              const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
              handleChange('card_number', formatted);
            }}
            maxLength={19}
            disabled={isProcessing}
          />
          {errors.card_number && (
            <span className="error-message">{errors.card_number}</span>
          )}
        </div>

        {/* Nombre del titular */}
        <div className="form-group">
          <label className="form-label">Nombre del titular</label>
          <input
            type="text"
            className={`form-input ${errors.card_holder_name ? 'error' : ''}`}
            placeholder="Como aparece en la tarjeta"
            value={cardData.card_holder_name}
            onChange={(e) =>
              handleChange('card_holder_name', e.target.value.toUpperCase())
            }
            disabled={isProcessing}
          />
          {errors.card_holder_name && (
            <span className="error-message">{errors.card_holder_name}</span>
          )}
        </div>

        {/* Expiración y CVV */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha de expiración</label>
            <div className="expiry-inputs">
              <input
                type="text"
                className={`form-input ${errors.expiry ? 'error' : ''}`}
                placeholder="MM"
                value={cardData.expiry_month}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                  if (parseInt(value) > 12) return;
                  handleChange('expiry_month', value);
                }}
                maxLength={2}
                disabled={isProcessing}
              />
              <span className="expiry-separator">/</span>
              <input
                type="text"
                className={`form-input ${errors.expiry ? 'error' : ''}`}
                placeholder="AA"
                value={cardData.expiry_year}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                  handleChange('expiry_year', value);
                }}
                maxLength={2}
                disabled={isProcessing}
              />
            </div>
            {errors.expiry && (
              <span className="error-message">{errors.expiry}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              CVV
              <span className="cvv-info" title="Código de seguridad de 3 o 4 dígitos">
                <Info size={14} />
              </span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.cvv ? 'error' : ''}`}
              placeholder="123"
              value={cardData.cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                handleChange('cvv', value);
              }}
              maxLength={cardBrand === 'amex' ? 4 : 3}
              disabled={isProcessing}
            />
            {errors.cvv && <span className="error-message">{errors.cvv}</span>}
          </div>
        </div>

        {/* Cuotas (solo para crédito) */}
        {cardData.card_type === 'credit' && (
          <div className="form-group">
            <label className="form-label">Número de cuotas</label>
            <select
              className="form-select"
              value={cardData.installments}
              onChange={(e) =>
                handleChange('installments', parseInt(e.target.value))
              }
              disabled={isProcessing}
            >
              {installmentOptions.map((num) => (
                <option key={num} value={num}>
                  {num} cuota{num > 1 ? 's' : ''} de $
                  {installmentAmount.toLocaleString('es-CO', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Total */}
        <div className="payment-summary">
          <div className="summary-row">
            <span>Total a pagar:</span>
            <span className="summary-amount">
              ${orderAmount.toLocaleString('es-CO')} COP
            </span>
          </div>
          {cardData.card_type === 'credit' && cardData.installments! > 1 && (
            <div className="summary-row installments">
              <span>
                {cardData.installments} cuotas de:
              </span>
              <span>
                ${installmentAmount.toLocaleString('es-CO')} COP
              </span>
            </div>
          )}
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          className="submit-button"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="spinner-small"></div>
              Procesando pago...
            </>
          ) : (
            <>
              <Lock size={20} />
              Pagar ${orderAmount.toLocaleString('es-CO')} COP
            </>
          )}
        </button>

        {/* Información de seguridad */}
        <div className="security-info">
          <Lock size={16} />
          <span>
            Tus datos están protegidos con encriptación de nivel bancario
          </span>
        </div>
      </form>
    </div>
  );
};

export default CreditCardForm;
