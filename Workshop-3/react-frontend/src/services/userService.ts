import axios, { AxiosResponse } from 'axios';
import { AuthService } from './authService';

// Configuration for Java Backend (Users - Auth Service)
const JAVA_API_BASE_URL = 'http://localhost:8081/api';

const userApi = axios.create({
  baseURL: JAVA_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to Python backend requests
userApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle response errors
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  // Support both camelCase (Java backend) and snake_case (Python backend) formats
  phoneNumber?: string;
  phone_number?: string;
  userType?: string;
  user_type?: 'admin' | 'organizer' | 'buyer';
  role?: string; // From Java backend (ROLE_ADMIN, ROLE_ORGANIZER, ROLE_BUYER)
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'active' | 'inactive' | 'suspended' | string;
  organizationName?: string;
  organization_name?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  lastLogin?: string;
  last_login?: string;
}

export interface UserStatistics {
  totalUsers: number;
  totalAdmins: number;
  totalOrganizers: number;
  totalBuyers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
}

export class UserService {
  // Fetch all users
  static async getUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await userApi.get('/users', {
        params: { skip, limit },
      });
      console.log('Users response:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || error.message || 'Error fetching users');
    }
  }

  // Fetch user by ID
  static async getUserById(userId: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await userApi.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error fetching user');
    }
  }

  // Calculate user statistics
  static calculateStatistics(users: User[]): UserStatistics {
    // Normalize user data to ensure status and user_type are always set
    const normalizedUsers = users.map(u => {
      // Normalize status (Java uses uppercase, Python uses lowercase)
      const status = (u.status || 'ACTIVE').toUpperCase();
      const normalizedStatus = status === 'ACTIVE' ? 'active' : 
                               status === 'INACTIVE' ? 'inactive' : 
                               status === 'SUSPENDED' ? 'suspended' : 'active';
      
      // Normalize user_type from role or userType
      let userType = u.user_type || u.userType?.toLowerCase();
      if (!userType && u.role) {
        // Convert ROLE_ADMIN -> admin, ROLE_ORGANIZER -> organizer, ROLE_BUYER -> buyer
        userType = u.role.replace('ROLE_', '').toLowerCase();
      }
      
      return {
        ...u,
        status: normalizedStatus as 'active' | 'inactive' | 'suspended',
        user_type: (userType || 'buyer') as 'admin' | 'organizer' | 'buyer',
        phone_number: u.phone_number || u.phoneNumber,
        organization_name: u.organization_name || u.organizationName,
        created_at: u.created_at || u.createdAt,
      };
    });
    
    return {
      totalUsers: normalizedUsers.length,
      totalAdmins: normalizedUsers.filter(u => u.user_type === 'admin').length,
      totalOrganizers: normalizedUsers.filter(u => u.user_type === 'organizer').length,
      totalBuyers: normalizedUsers.filter(u => u.user_type === 'buyer').length,
      activeUsers: normalizedUsers.filter(u => u.status === 'active').length,
      inactiveUsers: normalizedUsers.filter(u => u.status === 'inactive').length,
      suspendedUsers: normalizedUsers.filter(u => u.status === 'suspended').length,
    };
  }
}

