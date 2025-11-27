// User and authentication types
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

// Event and category types
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
  ageRestriction?: string;
  maxTicketsPerPurchase?: number;
}

// Ticket and order types
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
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  buyerId: number;
  eventId?: number;
  ticketTypeId?: number;
  quantity?: number;
  refundReason?: string;
}

export interface TicketTypeStats {
  ticketTypeId: number;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  remaining: number;
  revenue: number;
}

export interface EventStatistics {
  eventId: number;
  ticketsSold: number;
  totalRevenue: number;
  remainingCapacity: number;
  ticketTypes: TicketTypeStats[];
}

export interface BuyerTicket {
  id: number;
  qrCode: string;
  status: 'pending' | 'confirmed' | 'cancelled' | string;
  ticketTypeId: number;
  ticketTypeName: string;
  ticketPrice: number;
  eventId: number;
  eventTitle: string;
  eventStart: string;
  locationName?: string;
  orderId: number;
  orderNumber: string;
}

// API types
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

// Form state definitions
export interface FormState {
  isSubmitting: boolean;
  error?: string;
}
