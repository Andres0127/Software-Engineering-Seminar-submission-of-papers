import axios, { AxiosResponse } from 'axios';
import { Event, Category, Location, ApiResponse } from '../types';
import { AuthService } from './authService';

// Configuración para Python Backend (Events)
const PYTHON_API_BASE_URL = 'http://localhost:8000/api';

const eventApi = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT a las requests del Python backend
eventApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
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
  // Obtener todos los eventos
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
      throw new Error(error.response?.data?.message || 'Error al obtener eventos');
    }
  }

  // Obtener evento por ID
  static async getEventById(eventId: number): Promise<Event> {
    try {
      const response: AxiosResponse<Event> = await eventApi.get(`/events/${eventId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Evento no encontrado');
      }
      throw new Error(error.response?.data?.message || 'Error al obtener evento');
    }
  }

  // Crear nuevo evento (solo organizers/admin)
  static async createEvent(eventData: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    maxAttendees: number;
    ticketPrice: number;
    categoryId: number;
    locationId: number;
    status?: 'DRAFT' | 'PUBLISHED';
  }): Promise<Event> {
    try {
      const response: AxiosResponse<Event> = await eventApi.post('/events', eventData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear evento');
    }
  }

  // Actualizar evento (solo owner/admin)
  static async updateEvent(eventId: number, eventData: Partial<Event>): Promise<Event> {
    try {
      const response: AxiosResponse<Event> = await eventApi.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar evento');
    }
  }

  // Eliminar evento (solo owner/admin)
  static async deleteEvent(eventId: number): Promise<void> {
    try {
      await eventApi.delete(`/events/${eventId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar evento');
    }
  }

  // Obtener eventos del usuario actual (organizer)
  static async getMyEvents(): Promise<Event[]> {
    try {
      const response: AxiosResponse<Event[]> = await eventApi.get('/events/my-events');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mis eventos');
    }
  }

  // Obtener categorías
  static async getCategories(): Promise<Category[]> {
    try {
      const response: AxiosResponse<Category[]> = await eventApi.get('/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener categorías');
    }
  }

  // Obtener ubicaciones
  static async getLocations(): Promise<Location[]> {
    try {
      const response: AxiosResponse<Location[]> = await eventApi.get('/locations');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener ubicaciones');
    }
  }

  // Buscar eventos por texto
  static async searchEvents(query: string): Promise<Event[]> {
    try {
      const response: AxiosResponse<Event[]> = await eventApi.get(`/events/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en la búsqueda');
    }
  }

  // Obtener estadísticas de evento (para organizers)
  static async getEventStatistics(eventId: number): Promise<any> {
    try {
      const response = await eventApi.get(`/events/${eventId}/statistics`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
}

export default EventService;
