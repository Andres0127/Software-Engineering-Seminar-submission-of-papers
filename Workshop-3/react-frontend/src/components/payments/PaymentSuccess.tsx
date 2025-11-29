import React from 'react';
import { CheckCircle, Download, ArrowRight, Home, Mail, Ticket, Sparkles, Star, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentConfirmation } from '../../services/paymentService';
import './PaymentSuccess.css';

interface PaymentSuccessProps {
  confirmation: PaymentConfirmation;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ confirmation }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  };

  const handleViewTickets = () => {
    navigate('/my-tickets');
  };

  const handleGoHome = () => {
    navigate('/events');
  };

  return (
    <div className="payment-success-container">
      <div className="success-content">
        {/* Animación de éxito */}
        <div className="success-animation">
          <div className="success-circle">
            <CheckCircle className="success-icon" />
          </div>
          <div className="success-confetti">
            <Sparkles className="confetti-icon" size={24} />
            <Star className="confetti-icon" size={20} />
            <Circle className="confetti-icon" size={16} />
            <Sparkles className="confetti-icon" size={24} />
            <Star className="confetti-icon" size={20} />
            <Circle className="confetti-icon" size={16} />
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className="success-title">¡Pago Exitoso!</h1>
        <p className="success-subtitle">{confirmation.message}</p>

        {/* Detalles del pago */}
        <div className="payment-details-card">
          <div className="detail-row">
            <span className="detail-label">Número de orden:</span>
            <span className="detail-value">{confirmation.order_number}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">ID de transacción:</span>
            <span className="detail-value mono">
              {confirmation.payment.transaction_id}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Monto pagado:</span>
            <span className="detail-value highlight">
              ${confirmation.payment.amount.toLocaleString('es-CO')} COP
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Método de pago:</span>
            <span className="detail-value capitalize">
              {confirmation.payment.payment_method.replace('_', ' ')}
            </span>
          </div>
          {confirmation.payment.payment_provider && (
            <div className="detail-row">
              <span className="detail-label">Proveedor:</span>
              <span className="detail-value capitalize">
                {confirmation.payment.payment_provider}
              </span>
            </div>
          )}
          {confirmation.payment.authorization_code && (
            <div className="detail-row">
              <span className="detail-label">Código de autorización:</span>
              <span className="detail-value mono">
                {confirmation.payment.authorization_code}
              </span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Fecha:</span>
            <span className="detail-value">
              {formatDate(confirmation.payment.payment_date)}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Tickets generados:</span>
            <span className="detail-value badge">
              {confirmation.tickets_generated} ticket
              {confirmation.tickets_generated > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="info-boxes">
          <div className="info-box">
            <Mail className="info-icon" size={24} />
            <div className="info-text">
              <strong>Confirmación enviada</strong>
              <p>
                Hemos enviado un email con los detalles de tu compra y tus
                tickets
              </p>
            </div>
          </div>
          <div className="info-box">
            <Ticket className="info-icon" size={24} />
            <div className="info-text">
              <strong>Tickets disponibles</strong>
              <p>Puedes descargar tus tickets desde la sección "Mis Tickets"</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="success-actions">
          <button className="action-button primary" onClick={handleViewTickets}>
            <Download size={20} />
            Ver mis tickets
            <ArrowRight size={20} />
          </button>
          <button className="action-button secondary" onClick={handleGoHome}>
            <Home size={20} />
            Ir al inicio
          </button>
        </div>

        {/* Footer */}
        <div className="success-footer">
          <p>
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a href="mailto:soporte@eventplatform.com">
              soporte@eventplatform.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
