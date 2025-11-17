import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings,
  Plus 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: user?.userType !== 'BUYER' // Buyers no ven dashboard general
    },
    {
      name: 'Eventos',
      href: '/events',
      icon: Calendar,
      show: true // Todos pueden ver eventos
    },
    {
      name: 'Mis Tickets',
      href: '/tickets',
      icon: Ticket,
      show: user?.userType === 'BUYER' || user?.userType === 'ADMIN'
    },
    {
      name: 'Crear Evento',
      href: '/events/create',
      icon: Plus,
      show: user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN'
    },
    {
      name: 'Mis Eventos',
      href: '/organizer',
      icon: BarChart3,
      show: user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN'
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: Users,
      show: user?.userType === 'ADMIN'
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      show: true // Todos pueden ver configuración
    }
  ];

  return (
    <div className="sidebar" style={{ width: '280px', minHeight: '100vh' }}>
      <div className="p-8">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navigation
            .filter(item => item.show)
            .map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  isActive
                    ? 'sidebar-link-active'
                    : 'sidebar-link'
                }
              >
                <div className="sidebar-icon">
                  <item.icon className="w-5 h-5" />
                </div>
                <span>{item.name}</span>
              </NavLink>
            ))}
        </nav>
      </div>
    </div>
  );
};
