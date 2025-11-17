// Tipos de usuario y autenticación
export interface User {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role: string;
  userType: 'ADMIN' | 'ORGANIZER' | 'BUYER';
  createdAt: string;
  lastLogin?: string;
  organizationName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  userType: 'ADMIN' | 'ORGANIZER' | 'BUYER';
  phoneNumber?: string;
  organizationName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// Tipos de eventos y categorías
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  capacity: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  ticketPrice: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  categoryId: number;
  locationId: number;
  organizerId: number;
  category?: Category;
  location?: Location;
}

// Tipos de tickets y órdenes
export interface TicketType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  benefits?: string;
  eventId: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  purchaseDate: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  buyerId: number;
}

// Tipos de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

// Tipos de formularios
export interface FormState {
  isSubmitting: boolean;
  error?: string;
}
