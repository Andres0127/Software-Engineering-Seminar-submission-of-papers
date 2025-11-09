import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketPurchasePage } from './pages/TicketPurchasePage';
import { TicketsPage } from './pages/TicketsPage';

// Componente para rutas protegidas por rol
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

// Componente para redirección inteligente basada en rol
const SmartRedirect: React.FC = () => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Buyers van directo a eventos
  if (user.userType === 'BUYER') {
    return <Navigate to="/events" replace />;
  }
  
  // Organizers y Admins van al dashboard
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Verificar autenticación al cargar la app
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirección inteligente basada en rol */}
            <Route 
              index 
              element={<SmartRedirect />}
            />
            
            {/* Dashboard solo para organizers y admins */}
            <Route 
              path="dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                  <DashboardPage />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Eventos - todos pueden ver */}
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="events/:id/tickets" element={<TicketPurchasePage />} />
            
            {/* Mis tickets - solo buyers y admins */}
            <Route 
              path="tickets" 
              element={
                <RoleProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                  <TicketsPage />
                </RoleProtectedRoute>
              } 
            />
          </Route>
          
          {/* Ruta por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Ruta 404 */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--gray-900)' }}>404</h1>
                  <p style={{ color: 'var(--gray-600)' }}>Página no encontrada</p>
                </div>
              </div>
            } 
          />
        </Routes>
      </Router>
      
      {/* Notificaciones toast */}
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
