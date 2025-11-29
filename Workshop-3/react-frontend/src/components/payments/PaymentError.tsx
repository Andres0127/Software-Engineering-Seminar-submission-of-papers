import React from 'react';
import { XCircle, RefreshCw, Home, HelpCircle, Wallet, Calendar, Lock, Ban, Clock, Wifi, AlertTriangle, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PaymentError.css';

interface PaymentErrorProps {
  error: {
    message: string;
    error_code?: string;
    transaction_id?: string;
  };
  onRetry: () => void;
}

const PaymentError: React.FC<PaymentErrorProps> = ({ error, onRetry }) => {
  const navigate = useNavigate();

  const getErrorIcon = () => {
    const iconProps = { size: 48, strokeWidth: 2 };
    switch (error.error_code) {
      case 'VALIDATION_ERROR':
        return <AlertTriangle {...iconProps} className="error-type-icon" style={{ color: '#f59e0b' }} />;
      case 'UNAUTHORIZED':
        return <Lock {...iconProps} className="error-type-icon" style={{ color: '#f59e0b' }} />;
      case 'INSUFFICIENT_FUNDS':
        return <Wallet {...iconProps} className="error-type-icon" style={{ color: '#f59e0b' }} />;
      case 'CARD_EXPIRED':
        return <Calendar {...iconProps} className="error-type-icon" style={{ color: '#8b5cf6' }} />;
      case 'INVALID_CVV':
        return <Lock {...iconProps} className="error-type-icon" style={{ color: '#ef4444' }} />;
      case 'CARD_DECLINED':
        return <Ban {...iconProps} className="error-type-icon" style={{ color: '#dc2626' }} />;
      case 'TIMEOUT':
        return <Clock {...iconProps} className="error-type-icon" style={{ color: '#6366f1' }} />;
      case 'NETWORK_ERROR':
        return <Wifi {...iconProps} className="error-type-icon" style={{ color: '#3b82f6' }} />;
      default:
        return <AlertTriangle {...iconProps} className="error-type-icon" style={{ color: '#ef4444' }} />;
    }
  };

  const getErrorAdvice = () => {
    switch (error.error_code) {
      case 'VALIDATION_ERROR':
        return 'Los datos ingresados no son válidos. Por favor, revisa la información e intenta nuevamente.';
      case 'UNAUTHORIZED':
        return 'Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente para continuar con el pago.';
      case 'INSUFFICIENT_FUNDS':
        return 'Verifica que tu cuenta tenga fondos suficientes o intenta con otro método de pago.';
      case 'CARD_EXPIRED':
        return 'Tu tarjeta ha expirado. Por favor, usa una tarjeta válida.';
      case 'INVALID_CVV':
        return 'El código CVV ingresado no es correcto. Verifica el código de seguridad.';
      case 'CARD_DECLINED':
        return 'Tu banco ha rechazado la transacción. Contacta a tu entidad financiera.';
      case 'TIMEOUT':
        return 'La transacción tardó demasiado. Por favor, intenta nuevamente.';
      case 'NETWORK_ERROR':
        return 'Hubo un problema de conexión. Verifica tu internet e intenta de nuevo.';
      default:
        return 'Por favor, verifica tus datos e intenta nuevamente.';
    }
  };

  return (
    <div className="payment-error-container">
      <div className="error-content">
        {/* Animación de error */}
        <div className="error-animation">
          <div className="error-circle">
            <XCircle className="error-icon" />
          </div>
          <div className="error-type-indicator">{getErrorIcon()}</div>
        </div>

        {/* Mensaje principal */}
        <h1 className="error-title">Pago No Procesado</h1>
        <div className="error-subtitle">
          {error.message.split('\n').map((line, index) => (
            <p key={index} style={{ margin: '0.5rem 0' }}>{line}</p>
          ))}
        </div>

        {/* Detalles del error */}
        <div className="error-details-card">
          {error.error_code && (
            <div className="error-detail-row">
              <span className="error-label">Código de error:</span>
              <span className="error-code-badge">{error.error_code}</span>
            </div>
          )}
          {error.transaction_id && (
            <div className="error-detail-row">
              <span className="error-label">ID de transacción:</span>
              <span className="error-value mono">{error.transaction_id}</span>
            </div>
          )}
          <div className="error-advice">
            <HelpCircle size={20} />
            <p>{getErrorAdvice()}</p>
          </div>
        </div>

        {/* Sugerencias */}
        <div className="suggestions-card">
          <div className="suggestions-header">
            <HelpCircle size={20} />
            <h3>¿Qué puedes hacer?</h3>
          </div>
          <ul>
            <li>Verifica que los datos ingresados sean correctos</li>
            <li>Asegúrate de tener fondos suficientes</li>
            <li>Intenta con otro método de pago</li>
            <li>Contacta a tu banco si el problema persiste</li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="error-actions">
          <button className="action-button primary" onClick={onRetry}>
            <RefreshCw size={20} />
            Intentar nuevamente
          </button>
          <button
            className="action-button secondary"
            onClick={() => navigate('/events')}
          >
            <Home size={20} />
            Volver al inicio
          </button>
        </div>

        {/* Soporte */}
        <div className="support-section">
          <h4>¿Necesitas ayuda?</h4>
          <p>
            Nuestro equipo de soporte está disponible para ayudarte
          </p>
          <div className="support-options">
            <a href="mailto:soporte@eventplatform.com" className="support-link">
              <Mail size={18} />
              soporte@eventplatform.com
            </a>
            <a href="tel:+573001234567" className="support-link">
              <Phone size={18} />
              +57 300 123 4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
