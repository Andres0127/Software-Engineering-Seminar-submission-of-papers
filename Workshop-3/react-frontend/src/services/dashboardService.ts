import axios from 'axios';

const API_URL = 'http://localhost:8000/api/orders';

export interface DashboardStats {
  totalRevenue: number;
  totalEvents: number;
  totalTicketsSold: number;
  activeEvents: number;
  revenueByEvent: Array<{ eventName: string; revenue: number }>;
  salesOverTime: Array<{ date: string; revenue: number; orders: number }>;
  ticketTypeDistribution: Array<{ ticketType: string; quantity: number; revenue: number }>;
  orderStatusDistribution: Array<{ status: string; count: number }>;
  recentEvents: Array<{
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    revenue: number;
    ticketsSold: number;
    status: string;
  }>;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const dashboardService = {
  /**
   * Get dashboard statistics for organizer
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};
