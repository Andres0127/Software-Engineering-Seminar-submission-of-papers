import React, { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';
import CreditCardForm from './CreditCardForm';
import PSEForm from './PSEForm';
import DigitalWalletForm from './DigitalWalletForm';
import PaymentSuccess from './PaymentSuccess';
import PaymentError from './PaymentError';
import paymentService, {
  PaymentMethod,
  PaymentConfirmation,
  CreditCardData,
  PSEData,
  DigitalWalletData,
} from '../../services/paymentService';
import './PaymentFlow.css';

interface PaymentFlowProps {
  orderId: number;
  orderAmount: number;
  orderNumber: string;
}

type PaymentStep =
  | 'select-method'
  | 'enter-details'
  | 'processing'
  | 'success'
  | 'error';

const PaymentFlow: React.FC<PaymentFlowProps> = ({
  orderId,
  orderAmount,
  orderNumber,
}) => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('select-method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState<PaymentConfirmation | null>(
    null
  );
  const [error, setError] = useState<any>(null);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCurrentStep('enter-details');
  };

  const handleBackToMethods = () => {
    setSelectedMethod(null);
    setCurrentStep('select-method');
    setError(null);
  };

  const processPayment = async (paymentData: any) => {
    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      const result = await paymentService.processPayment({
        order_id: orderId,
        ...paymentData,
      });

      setConfirmation(result);
      setCurrentStep('success');
    } catch (err: any) {
      console.error('Payment error:', err);
      
      // Manejar error 422 (Validación)
      if (err.response?.status === 422) {
        const validationErrors = err.response?.data?.detail;
        let errorMessage = 'Error de validación en los datos del pago.';
        
        if (Array.isArray(validationErrors)) {
          // Pydantic devuelve un array de errores
          errorMessage = validationErrors.map((e: any) => 
            `${e.loc?.join(' > ')}: ${e.msg}`
          ).join('\n');
        } else if (typeof validationErrors === 'string') {
          errorMessage = validationErrors;
        }
        
        setError({
          message: errorMessage,
          error_code: 'VALIDATION_ERROR',
          transaction_id: undefined,
        });
      }
      // Manejar error 401 (No autenticado)
      else if (err.response?.status === 401) {
        setError({
          message: 'Sesión expirada o no válida. Por favor inicia sesión nuevamente.',
          error_code: 'UNAUTHORIZED',
          transaction_id: undefined,
        });
      }
      // Manejar el error 402 (Payment Required)
      else if (err.response?.status === 402) {
        setError(err.response.data.detail);
      }
      // Otros errores del servidor
      else if (err.response?.data) {
        setError({
          message: err.response.data.detail || 'Error al procesar el pago',
          error_code: err.response.data.error_code || 'PAYMENT_ERROR',
          transaction_id: err.response.data.transaction_id,
        });
      }
      // Error de red o conexión
      else {
        setError({
          message: 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.',
          error_code: 'NETWORK_ERROR',
        });
      }

      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreditCardSubmit = async (data: CreditCardData) => {
    await processPayment({
      payment_method: selectedMethod?.code,
      credit_card_data: data,
    });
  };

  const handlePSESubmit = async (data: PSEData) => {
    await processPayment({
      payment_method: 'pse',
      pse_data: data,
    });
  };

  const handleDigitalWalletSubmit = async (data: DigitalWalletData) => {
    await processPayment({
      payment_method: selectedMethod?.code,
      digital_wallet_data: data,
    });
  };

  const handleRetryPayment = () => {
    setError(null);
    setCurrentStep('select-method');
    setSelectedMethod(null);
  };

  // Step: Seleccionar método de pago
  if (currentStep === 'select-method') {
    return (
      <div className="payment-flow-container">
        <PaymentMethodSelector
          onSelectMethod={handleMethodSelect}
          selectedMethod={selectedMethod?.code}
        />
      </div>
    );
  }

  // Step: Formulario de pago
  if (currentStep === 'enter-details' && selectedMethod) {
    // Tarjetas de crédito/débito
    if (['credit_card', 'debit_card'].includes(selectedMethod.code)) {
      return (
        <div className="payment-flow-container">
          <CreditCardForm
            onSubmit={handleCreditCardSubmit}
            onBack={handleBackToMethods}
            isProcessing={isProcessing}
            orderAmount={orderAmount}
          />
        </div>
      );
    }

    // PSE
    if (selectedMethod.code === 'pse') {
      return (
        <div className="payment-flow-container">
          <PSEForm
            onSubmit={handlePSESubmit}
            onBack={handleBackToMethods}
            isProcessing={isProcessing}
            orderAmount={orderAmount}
          />
        </div>
      );
    }

    // Billeteras digitales
    if (['paypal', 'nequi', 'daviplata', 'google_pay'].includes(selectedMethod.code)) {
      return (
        <div className="payment-flow-container">
          <DigitalWalletForm
            walletType={selectedMethod.code as any}
            onSubmit={handleDigitalWalletSubmit}
            onBack={handleBackToMethods}
            isProcessing={isProcessing}
            orderAmount={orderAmount}
          />
        </div>
      );
    }
  }

  // Step: Procesando pago
  if (currentStep === 'processing') {
    return (
      <div className="payment-flow-container">
        <div className="payment-processing">
          <div className="processing-spinner"></div>
          <h2>Procesando tu pago...</h2>
          <p>Por favor espera, no cierres esta ventana</p>
          <div className="processing-steps">
            <div className="processing-step active">
              <div className="step-dot"></div>
              <span>Validando datos</span>
            </div>
            <div className="processing-step active">
              <div className="step-dot"></div>
              <span>Contactando con el banco</span>
            </div>
            <div className="processing-step">
              <div className="step-dot"></div>
              <span>Confirmando transacción</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step: Pago exitoso
  if (currentStep === 'success' && confirmation) {
    return <PaymentSuccess confirmation={confirmation} />;
  }

  // Step: Error en el pago
  if (currentStep === 'error' && error) {
    return <PaymentError error={error} onRetry={handleRetryPayment} />;
  }

  return null;
};

export default PaymentFlow;
