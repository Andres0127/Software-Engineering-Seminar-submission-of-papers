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
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  };

  const handleViewTickets = () => {
    navigate('/tickets');
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

        {/* Main message */}
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-subtitle">{confirmation.message}</p>

        {/* Payment details */}
        <div className="payment-details-card">
          <div className="detail-row">
            <span className="detail-label">Order Number:</span>
            <span className="detail-value">{confirmation.order_number}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Transaction ID:</span>
            <span className="detail-value mono">
              {confirmation.payment.transaction_id}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount Paid:</span>
            <span className="detail-value highlight">
              ${confirmation.payment.amount.toLocaleString('en-US')} COP
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Method:</span>
            <span className="detail-value capitalize">
              {confirmation.payment.payment_method.replace('_', ' ')}
            </span>
          </div>
          {confirmation.payment.payment_provider && (
            <div className="detail-row">
              <span className="detail-label">Provider:</span>
              <span className="detail-value capitalize">
                {confirmation.payment.payment_provider}
              </span>
            </div>
          )}
          {confirmation.payment.authorization_code && (
            <div className="detail-row">
              <span className="detail-label">Authorization Code:</span>
              <span className="detail-value mono">
                {confirmation.payment.authorization_code}
              </span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">
              {formatDate(confirmation.payment.payment_date)}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Tickets Generated:</span>
            <span className="detail-value badge">
              {confirmation.tickets_generated} ticket
              {confirmation.tickets_generated > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Additional information */}
        <div className="info-boxes">
          <div className="info-box">
            <Mail className="info-icon" size={24} />
            <div className="info-text">
              <strong>Confirmation Sent</strong>
              <p>
                We have sent an email with your purchase details and tickets
              </p>
            </div>
          </div>
          <div className="info-box">
            <Ticket className="info-icon" size={24} />
            <div className="info-text">
              <strong>Tickets Available</strong>
              <p>You can download your tickets from the "My Tickets" section</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="success-actions">
          <button className="action-button primary" onClick={handleViewTickets}>
            <Download size={20} />
            View My Tickets
            <ArrowRight size={20} />
          </button>
          <button className="action-button secondary" onClick={handleGoHome}>
            <Home size={20} />
            Go to Home
          </button>
        </div>

        {/* Footer */}
        <div className="success-footer">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@eventplatform.com">
              support@eventplatform.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
