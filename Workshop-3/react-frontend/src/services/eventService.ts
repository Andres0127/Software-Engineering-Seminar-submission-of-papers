import axios, { AxiosResponse } from 'axios';
import { Event, Category, Location, ApiResponse, EventStatistics } from '../types';
import { AuthService } from './authService';

// Configuration for Python Backend (Events)
const PYTHON_API_BASE_URL = 'http://localhost:8000/api';

const eventApi = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to Python backend requests
eventApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle response errors
eventApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - redirigir a login
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class EventService {
  // Fetch all events
  static async getEvents(filters?: {
    categoryId?: number;
    locationId?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const response: AxiosResponse<Event[]> = await eventApi.get(
        `/events?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Unable to fetch events');
    }
  }

  // Fetch event by ID
  static async getEventById(eventId: number): Promise<Event> {
    try {
      const response: AxiosResponse<Event> = await eventApi.get(`/events/${eventId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error(error.response?.data?.message || 'Unable to fetch event');
    }
  }

  // Crear nuevo evento (solo organizers/admin)
  static async createEvent(eventData: {
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    maxAttendees: number;
    ticketPrice: number;
    categoryId: number;
    locationId: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
    maxTicketsPerPurchase?: number;
    ageRestriction?: string;
  }): Promise<Event> {
    try {
      const response: AxiosResponse<Event> = await eventApi.post('/events/', eventData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error creating event');
    }
  }

  // Actualizar evento (solo owner/admin)
  static async updateEvent(eventId: number, eventData: Partial<Event>): Promise<Event> {
    try {
      const response: AxiosResponse<Event> = await eventApi.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error updating event');
    }
  }

  // Eliminar evento (solo owner/admin)
  static async deleteEvent(eventId: number): Promise<void> {
    try {
      await eventApi.delete(`/events/${eventId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting event');
    }
  }

  // Fetch events for the current organizer
  static async getMyEvents(): Promise<Event[]> {
    try {
      const response: AxiosResponse<Event[]> = await eventApi.get('/events/my-events');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching my events');
    }
  }

  // Fetch categories
  static async getCategories(): Promise<Category[]> {
    try {
      const response: AxiosResponse<Category[]> = await eventApi.get('/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching categories');
    }
  }

  // Fetch locations
  static async getLocations(): Promise<Location[]> {
    try {
      const response: AxiosResponse<Location[]> = await eventApi.get('/locations');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching locations');
    }
  }

  // Search events by text
  static async searchEvents(query: string): Promise<Event[]> {
    try {
      const response: AxiosResponse<Event[]> = await eventApi.get(`/events/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error during search');
    }
  }

  // Fetch event statistics (for organizers)
  static async getEventStatistics(eventId: number): Promise<EventStatistics> {
    try {
      const response = await eventApi.get(`/events/${eventId}/statistics`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching statistics');
    }
  }
}

export default EventService;
