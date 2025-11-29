import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface PaymentMethod {
  code: string;
  name: string;
  icon: string;
  description: string;
  processing_time: string;
  fee_percentage: number;
}

export interface Bank {
  code: string;
  name: string;
}

export interface CreditCardData {
  card_number: string;
  card_holder_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  card_type: 'credit' | 'debit';
  installments?: number;
}

export interface PSEData {
  bank_code: string;
  bank_name: string;
  person_type: 'natural' | 'juridica';
  document_type: string;
  document_number: string;
  payer_name: string;
  payer_email: string;
}

export interface DigitalWalletData {
  wallet_type: 'paypal' | 'nequi' | 'daviplata' | 'google_pay';
  phone_number?: string;
  email?: string;
}

export interface CashPaymentData {
  payment_network: 'efecty' | 'baloto' | 'su_red';
  payer_name: string;
  payer_document: string;
  payer_email: string;
}

export interface PaymentRequest {
  order_id: number;
  payment_method: string;
  credit_card_data?: CreditCardData;
  pse_data?: PSEData;
  digital_wallet_data?: DigitalWalletData;
  cash_payment_data?: CashPaymentData;
}

export interface PaymentResponse {
  id: number;
  order_id: number;
  transaction_id: string;
  payment_status: string;
  payment_method: string;
  payment_provider?: string;
  amount: number;
  currency: string;
  payment_date: string;
  authorization_code?: string;
  payment_details?: any;
}

export interface PaymentConfirmation {
  success: boolean;
  message: string;
  payment: PaymentResponse;
  order_number: string;
  tickets_generated: number;
}

const paymentService = {
  /**
   * Obtiene la lista de métodos de pago disponibles
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await axios.get(`${API_BASE_URL}/payments/methods`);
    return response.data;
  },

  /**
   * Obtiene la lista de bancos para PSE
   */
  async getPSEBanks(): Promise<Bank[]> {
    const response = await axios.get(`${API_BASE_URL}/payments/banks`);
    return response.data;
  },

  /**
   * Procesa un pago
   */
  async processPayment(paymentData: PaymentRequest): Promise<PaymentConfirmation> {
    // Intentar con ambos nombres de token (authToken es el correcto del sistema)
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    // Debug: verificar token
    if (!token) {
      console.error('❌ No hay token de autenticación');
      console.error('Tokens en localStorage:', {
        authToken: localStorage.getItem('authToken'),
        token: localStorage.getItem('token'),
        allKeys: Object.keys(localStorage)
      });
      throw new Error('Usuario no autenticado. Por favor inicia sesión.');
    }
    
    console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
    console.log('📦 Datos del pago a enviar:', JSON.stringify(paymentData, null, 2));
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/process`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('✅ Respuesta del backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error del backend:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  /**
   * Obtiene los pagos de una orden específica
   */
  async getOrderPayments(orderId: number): Promise<PaymentResponse[]> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/payments/order/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Obtiene los detalles de un pago específico
   */
  async getPaymentDetails(paymentId: number): Promise<PaymentResponse> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Obtiene el historial de pagos del usuario
   */
  async getMyPaymentHistory(): Promise<PaymentResponse[]> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/payments/history/my-payments`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};

export default paymentService;
