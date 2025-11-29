import React, { useState } from 'react';
import { Wallet, Lock, Smartphone, Mail, CreditCard } from 'lucide-react';
import { DigitalWalletData } from '../../services/paymentService';
import './DigitalWalletForm.css';

interface DigitalWalletFormProps {
  walletType: 'paypal' | 'nequi' | 'daviplata' | 'google_pay';
  onSubmit: (data: DigitalWalletData) => void;
  onBack: () => void;
  isProcessing: boolean;
  orderAmount: number;
}

const DigitalWalletForm: React.FC<DigitalWalletFormProps> = ({
  walletType,
  onSubmit,
  onBack,
  isProcessing,
  orderAmount,
}) => {
  const [walletData, setWalletData] = useState<DigitalWalletData>({
    wallet_type: walletType,
    phone_number: '',
    email: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const walletInfo = {
    paypal: {
      name: 'PayPal',
      IconComponent: CreditCard,
      color: '#0070ba',
      requiresEmail: true,
      requiresPhone: false,
    },
    nequi: {
      name: 'Nequi',
      IconComponent: Smartphone,
      color: '#651fff',
      requiresEmail: false,
      requiresPhone: true,
    },
    daviplata: {
      name: 'DaviPlata',
      IconComponent: Wallet,
      color: '#ed1c24',
      requiresEmail: false,
      requiresPhone: true,
    },
    google_pay: {
      name: 'Google Pay',
      IconComponent: CreditCard,
      color: '#4285f4',
      requiresEmail: true,
      requiresPhone: false,
    },
  };

  const info = walletInfo[walletType];
  const WalletIcon = info.IconComponent;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (info.requiresPhone) {
      if (!walletData.phone_number || walletData.phone_number.length !== 10) {
        newErrors.phone_number = 'Número de celular inválido (10 dígitos)';
      }
    }

    if (info.requiresEmail) {
      if (!walletData.email || !/\S+@\S+\.\S+/.test(walletData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Limpiar campos opcionales que estén vacíos
      const cleanedData: DigitalWalletData = {
        wallet_type: walletData.wallet_type,
      };
      
      // Solo incluir phone_number si tiene valor
      if (walletData.phone_number && walletData.phone_number.trim() !== '') {
        cleanedData.phone_number = walletData.phone_number;
      }
      
      // Solo incluir email si tiene valor
      if (walletData.email && walletData.email.trim() !== '') {
        cleanedData.email = walletData.email;
      }
      
      onSubmit(cleanedData);
    }
  };

  const handleChange = (field: keyof DigitalWalletData, value: any) => {
    setWalletData({ ...walletData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="digital-wallet-form-container">
      <button className="back-button" onClick={onBack} disabled={isProcessing}>
        ← Volver a métodos de pago
      </button>

      <div className="wallet-form-header" style={{ borderColor: info.color }}>
        <div className="wallet-icon-large" style={{ background: info.color }}>
          <WalletIcon size={48} color="white" />
        </div>
        <div>
          <h2>Pago con {info.name}</h2>
          <p className="header-subtitle">
            Completa el pago usando tu cuenta de {info.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="wallet-form">
        {info.requiresPhone && (
          <div className="form-group">
            <label className="form-label">
              <Smartphone size={18} />
              Número de celular
            </label>
            <input
              type="tel"
              className={`form-input ${errors.phone_number ? 'error' : ''}`}
              placeholder="3001234567"
              value={walletData.phone_number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleChange('phone_number', value);
              }}
              disabled={isProcessing}
              maxLength={10}
            />
            {errors.phone_number && (
              <span className="error-message">{errors.phone_number}</span>
            )}
            <p className="input-hint">
              Ingresa el número asociado a tu cuenta de {info.name}
            </p>
          </div>
        )}

        {info.requiresEmail && (
          <div className="form-group">
            <label className="form-label">
              <Wallet size={18} />
              Correo electrónico
            </label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="tu@email.com"
              value={walletData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isProcessing}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
            <p className="input-hint">
              Correo asociado a tu cuenta de {info.name}
            </p>
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
        </div>

        {/* Info del wallet */}
        <div className="wallet-info-box" style={{ borderColor: info.color }}>
          <h4 style={{ color: info.color }}>
            <Lock size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} /> 
            Cómo funciona:
          </h4>
          <ol>
            {info.requiresPhone ? (
              <>
                <li>Ingresa tu número de celular registrado</li>
                <li>Recibirás una notificación en tu app de {info.name}</li>
                <li>Confirma el pago desde tu aplicación</li>
                <li>Recibirás la confirmación de tu compra</li>
              </>
            ) : (
              <>
                <li>Ingresa tu correo electrónico</li>
                <li>Serás redirigido a {info.name}</li>
                <li>Inicia sesión y confirma el pago</li>
                <li>Serás devuelto con tu comprobante</li>
              </>
            )}
          </ol>
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          className="submit-button"
          style={{ background: info.color }}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="spinner-small"></div>
              Procesando...
            </>
          ) : (
            <>
              <Lock size={20} />
              Pagar con {info.name}
            </>
          )}
        </button>

        {/* Seguridad */}
        <div className="security-info">
          <Lock size={16} />
          <span>Transacción segura protegida por {info.name}</span>
        </div>
      </form>
    </div>
  );
};

export default DigitalWalletForm;
