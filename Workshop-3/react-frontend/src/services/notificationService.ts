import axios from 'axios';

const API_URL = 'http://localhost:8000/api/notifications';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: number;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const notificationService = {
  /**
   * Get all user notifications
   */
  async getNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/`, {
        params: { unread_only: unreadOnly },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await axios.get(`${API_URL}/stats`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  },

  /**
   * Get single notification
   */
  async getNotification(id: number): Promise<Notification> {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(id: number): Promise<Notification> {
    try {
      const response = await axios.post(
        `${API_URL}/${id}/read`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(ids: number[]): Promise<{ success: boolean; marked_count: number }> {
    try {
      const response = await axios.post(
        `${API_URL}/mark-read`,
        { notification_ids: ids },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; marked_count: number }> {
    try {
      const response = await axios.post(
        `${API_URL}/mark-all-read`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};
