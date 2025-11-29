import axios from 'axios';

const API_URL = 'http://localhost:8000/api/orders';

export interface RefundRequest {
  id: number;
  order_number: string;
  purchase_date: string;
  status: string;
  total_amount: number;
  buyer_id: number;
  event_id: number;
  ticket_type_id: number;
  quantity: number;
  refund_reason: string;
  created_at: string;
  updated_at: string;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const refundService = {
  /**
   * Get all refund requests for organizer's events
   */
  async getRefundRequests(): Promise<RefundRequest[]> {
    try {
      const response = await axios.get(`${API_URL}/refund-requests`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      throw error;
    }
  },

  /**
   * Get single refund request details
   */
  async getRefundRequest(orderId: number): Promise<RefundRequest> {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching refund request:', error);
      throw error;
    }
  },

  /**
   * Approve refund request
   */
  async approveRefund(orderId: number): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/${orderId}/refund/approve`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error approving refund:', error);
      throw error;
    }
  },

  /**
   * Reject refund request
   */
  async rejectRefund(orderId: number, reason?: string): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/${orderId}/refund/reject`,
        { reason },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting refund:', error);
      throw error;
    }
  },
};
