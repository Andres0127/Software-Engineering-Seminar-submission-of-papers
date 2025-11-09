import axios, { AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:8081/api'; // Backend Java (Auth)

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas y errores
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class AuthService {
  // Login de usuario
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/login', credentials);
      
      // Adaptamos la respuesta del backend Java al formato esperado por el frontend
      const backendData = response.data;
      const adaptedResponse: AuthResponse = {
        token: backendData.token,
        user: {
          id: backendData.userId,
          name: backendData.name,
          firstName: backendData.name?.split(' ')[0],
          lastName: backendData.name?.split(' ').slice(1).join(' '),
          email: backendData.email,
          role: backendData.role,
          userType: backendData.role?.replace('ROLE_', '') as 'ADMIN' | 'ORGANIZER' | 'BUYER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          organizationName: backendData.organizationName
        },
        expiresIn: backendData.expiresIn || 86400000
      };
      
      // Guardar token y usuario en localStorage
      if (adaptedResponse.token) {
        localStorage.setItem('authToken', adaptedResponse.token);
        localStorage.setItem('user', JSON.stringify(adaptedResponse.user));
      }
      
      return adaptedResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en el login');
    }
  }

  // Registro de usuario
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/register', userData);
      
      // Adaptamos la respuesta del backend Java al formato esperado por el frontend
      const backendData = response.data;
      const adaptedResponse: AuthResponse = {
        token: backendData.token,
        user: {
          id: backendData.userId,
          name: backendData.name || userData.name,
          firstName: userData.name?.split(' ')[0],
          lastName: userData.name?.split(' ').slice(1).join(' '),
          email: backendData.email || userData.email,
          role: backendData.role,
          userType: backendData.role?.replace('ROLE_', '') as 'ADMIN' | 'ORGANIZER' | 'BUYER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          organizationName: userData.organizationName
        },
        expiresIn: backendData.expiresIn || 86400000
      };
      
      // Auto-login después del registro
      if (adaptedResponse.token) {
        localStorage.setItem('authToken', adaptedResponse.token);
        localStorage.setItem('user', JSON.stringify(adaptedResponse.user));
      }
      
      return adaptedResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en el registro');
    }
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await authApi.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await authApi.post('/auth/logout');
    } catch (error) {
      // Ignorar errores de logout del servidor
    } finally {
      // Limpiar storage local siempre
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Obtener token del localStorage
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Obtener usuario del localStorage
  static getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}

export default AuthService;
