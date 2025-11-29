import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, Wallet, Banknote, ChevronRight, Clock, Shield } from 'lucide-react';
import paymentService, { PaymentMethod } from '../../services/paymentService';
import './PaymentMethodSelector.css';

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: PaymentMethod) => void;
  selectedMethod?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelectMethod,
  selectedMethod,
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const data = await paymentService.getPaymentMethods();
      setMethods(data);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (code: string) => {
    switch (code) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="method-icon" />;
      case 'pse':
        return <Building2 className="method-icon" />;
      case 'paypal':
      case 'nequi':
      case 'daviplata':
      case 'google_pay':
        return <Wallet className="method-icon" />;
      case 'cash_payment':
        return <Banknote className="method-icon" />;
      default:
        return <CreditCard className="method-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="payment-methods-loading">
        <div className="spinner"></div>
        <p>Cargando métodos de pago...</p>
      </div>
    );
  }

  return (
    <div className="payment-method-selector">
      <h2 className="payment-title">Selecciona tu método de pago</h2>
      <p className="payment-subtitle">
        Elige cómo deseas pagar tus tickets de forma segura
      </p>

      <div className="payment-methods-grid">
        {methods.map((method) => (
          <button
            key={method.code}
            className={`payment-method-card ${
              selectedMethod === method.code ? 'selected' : ''
            }`}
            onClick={() => onSelectMethod(method)}
          >
            <div className="method-icon-wrapper">
              {getMethodIcon(method.code)}
            </div>
            <div className="method-info">
              <h3 className="method-name">{method.name}</h3>
              <p className="method-description">{method.description}</p>
              <div className="method-details">
                <span className="method-time">
                  <Clock size={14} /> {method.processing_time}
                </span>
                {method.fee_percentage > 0 && (
                  <span className="method-fee">
                    +{method.fee_percentage}% comisión
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="method-arrow" />
          </button>
        ))}
      </div>

      <div className="payment-security-badge">
        <Shield className="security-icon" size={20} />
        <span className="security-text">
          Pago 100% seguro y encriptado
        </span>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
