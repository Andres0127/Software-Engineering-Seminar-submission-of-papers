import axios, { AxiosResponse } from 'axios';
import { TicketType, Order, BuyerTicket } from '../types';
import { AuthService } from './authService';

// Configuration for Python Backend (Tickets & Orders)
const PYTHON_API_BASE_URL = 'http://localhost:8000/api';

const ticketApi = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
ticketApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle errors
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
  // Get ticket types for an event
  static async getTicketTypes(eventId: number): Promise<TicketType[]> {
    try {
      const response: AxiosResponse<TicketType[]> = await ticketApi.get(`/events/${eventId}/tickets`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching ticket types');
    }
  }

  // Create a purchase order
  static async createOrder(orderData: {
    eventId: number;
    ticketTypeId: number;
    quantity: number;
    buyerInfo?: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
    };
  }): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await ticketApi.post('/orders/', orderData);
      return response.data;
    } catch (error: any) {
      // FastAPI returns errors in response.data.detail
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error creating the order';
      // Preserve the original error so CheckoutPage can access response.data.detail
      const newError: any = new Error(errorMessage);
      newError.response = error.response;
      throw newError;
    }
  }

  // Confirm order payment
  static async confirmPayment(orderId: number, paymentData: {
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'CASH';
    transactionId?: string;
    paymentDetails?: any;
  }): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await ticketApi.post(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error processing payment');
    }
  }

  // Get the user's orders
  static async getMyOrders(): Promise<Order[]> {
    try {
      const response: AxiosResponse<Order[]> = await ticketApi.get('/orders/my-orders');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching orders');
    }
  }

  // Get tickets acquired by the user
  static async getMyTickets(): Promise<BuyerTicket[]> {
    try {
      const response: AxiosResponse<BuyerTicket[]> = await ticketApi.get('/tickets/my-tickets');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching tickets');
    }
  }

  // Fetch details of an order
  static async getOrderById(orderId: number): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await ticketApi.get(`/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching the order');
    }
  }

  // Cancel an order
  static async cancelOrder(orderId: number): Promise<void> {
    try {
      await ticketApi.post(`/orders/${orderId}/cancel`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error canceling the order');
    }
  }

  // Request a refund
  static async requestRefund(orderId: number, reason: string): Promise<void> {
    try {
      await ticketApi.post(`/orders/${orderId}/refund`, { reason });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error requesting a refund');
    }
  }

  // Check ticket availability
  static async checkTicketAvailability(eventId: number, ticketTypeId: number, quantity: number): Promise<{
    available: boolean;
    remainingTickets: number;
  }> {
    try {
      const response = await ticketApi.get(`/events/${eventId}/tickets/${ticketTypeId}/availability?quantity=${quantity}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error checking availability');
    }
  }
}

export default TicketService;
