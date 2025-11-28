import axios, { AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

// Base axios configuration
const API_BASE_URL = 'http://localhost:8081/api'; // Backend Java (Auth)

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the auth token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle responses and errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
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
      
      // Normalize the Java backend response to the frontend format
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
      
      // Persist token and user in localStorage
      if (adaptedResponse.token) {
        localStorage.setItem('authToken', adaptedResponse.token);
        localStorage.setItem('user', JSON.stringify(adaptedResponse.user));
      }
      
      return adaptedResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error during login');
    }
  }

  // Registro de usuario
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/register', userData);
      
      // Normalize the Java backend response to the frontend format
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
      
      // Auto-login after registration
      if (adaptedResponse.token) {
        localStorage.setItem('authToken', adaptedResponse.token);
        localStorage.setItem('user', JSON.stringify(adaptedResponse.user));
      }
      
      return adaptedResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error during registration');
    }
  }

  // Fetch the current user
  static async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await authApi.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error fetching current user');
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await authApi.post('/auth/logout');
    } catch (error) {
      // Ignorar errores de logout del servidor
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Check if the user is authenticated
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Retrieve token from localStorage
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Retrieve stored user from localStorage
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
