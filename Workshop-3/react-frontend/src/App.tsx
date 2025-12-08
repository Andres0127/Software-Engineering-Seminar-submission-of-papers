import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { OrganizerEventsPage } from './pages/OrganizerEventsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TicketPurchasePage } from './pages/TicketPurchasePage';
import { TicketsPage } from './pages/TicketsPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import RefundRequestsPage from './pages/RefundRequestsPage';
import { UsersPage } from './pages/UsersPage';

// Component that ensures routes are only accessible when the user has one of the allowed roles
const RoleProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[]; 
  redirectTo?: string;
}> = ({ children, allowedRoles, redirectTo = '/events' }) => {
  const { user } = useAuthStore();
  
  if (!user || !allowedRoles.includes(user.userType)) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

// Component that redirects users based on their role
const SmartRedirect: React.FC = () => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Buyers van directo a eventos
  if (user.userType === 'BUYER') {
    return <Navigate to="/events" replace />;
  }
  
  // Organizers and Admins go to dashboard
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication when the app loads
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Role-based smart redirect */}
            <Route 
              index 
              element={<SmartRedirect />}
            />
            
            {/* Dashboard accessible to organizers and admins */}
            <Route 
              path="dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                  <DashboardPage />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Events – everyone can view */}
            <Route path="events" element={<EventsPage />} />
            <Route
              path="events/create"
              element={
                <RoleProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                  <CreateEventPage />
                </RoleProtectedRoute>
              }
            />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="events/:id/edit" element={<CreateEventPage />} />
            <Route path="events/:id/tickets" element={<TicketPurchasePage />} />
            <Route path="events/:id/checkout" element={<CheckoutPage />} />
            <Route
              path="organizer"
              element={
                <RoleProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                  <OrganizerEventsPage />
                </RoleProtectedRoute>
              }
            />
            
            {/* My tickets - restricted to buyers and admins */}
            <Route 
              path="tickets" 
              element={
                <RoleProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                  <TicketsPage />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="orders" 
              element={
                <RoleProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                  <OrdersPage />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Profile - accessible to all authenticated users */}
            <Route 
              path="profile" 
              element={<ProfilePage />} 
            />
            
            {/* Refund requests - restricted to organizers and admins */}
            <Route 
              path="refunds" 
              element={
                <RoleProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                  <RefundRequestsPage />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Users - restricted to admins only */}
            <Route 
              path="users" 
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersPage />
                </RoleProtectedRoute>
              } 
            />
          </Route>
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 fallback */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--gray-900)' }}>404</h1>
                  <p style={{ color: 'var(--gray-600)' }}>Page not found</p>
                </div>
              </div>
            } 
          />
        </Routes>
      </Router>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
