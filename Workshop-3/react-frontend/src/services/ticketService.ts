import axios, { AxiosResponse } from 'axios';
import { TicketType, Order } from '../types';
import { AuthService } from './authService';

// Configuración para Python Backend (Tickets & Orders)
const PYTHON_API_BASE_URL = 'http://localhost:8000/api';

const ticketApi = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
ticketApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
ticketApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class TicketService {
  // Obtener tipos de tickets de un evento
  static async getTicketTypes(eventId: number): Promise<TicketType[]> {
    try {
      const response: AxiosResponse<TicketType[]> = await ticketApi.get(`/events/${eventId}/tickets`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener tipos de tickets');
    }
  }

  // Crear una orden de compra
  static async createOrder(orderData: {
    eventId: number;
    ticketTypeId: number;
    quantity: number;
    totalAmount: number;
    buyerInfo?: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
    };
  }): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await ticketApi.post('/orders', orderData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear la orden');
    }
  }

  // Confirmar pago de orden
  static async confirmPayment(orderId: number, paymentData: {
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'CASH';
    transactionId?: string;
    paymentDetails?: any;
  }): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await ticketApi.post(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al procesar el pago');
    }
  }

  // Obtener órdenes del usuario
  static async getMyOrders(): Promise<Order[]> {
    try {
      const response: AxiosResponse<Order[]> = await ticketApi.get('/orders/my-orders');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener órdenes');
    }
  }

  // Obtener detalle de una orden
  static async getOrderById(orderId: number): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await ticketApi.get(`/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener la orden');
    }
  }

  // Cancelar una orden
  static async cancelOrder(orderId: number): Promise<void> {
    try {
      await ticketApi.post(`/orders/${orderId}/cancel`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cancelar la orden');
    }
  }

  // Solicitar reembolso
  static async requestRefund(orderId: number, reason: string): Promise<void> {
    try {
      await ticketApi.post(`/orders/${orderId}/refund`, { reason });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al solicitar reembolso');
    }
  }

  // Verificar disponibilidad de tickets
  static async checkTicketAvailability(eventId: number, ticketTypeId: number, quantity: number): Promise<{
    available: boolean;
    remainingTickets: number;
  }> {
    try {
      const response = await ticketApi.get(`/events/${eventId}/tickets/${ticketTypeId}/availability?quantity=${quantity}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al verificar disponibilidad');
    }
  }
}

export default TicketService;
