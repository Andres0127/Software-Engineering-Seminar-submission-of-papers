import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Receipt
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: user?.userType !== 'BUYER'
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      show: true
    },
    {
      name: 'My Tickets',
      href: '/tickets',
      icon: Ticket,
      show: user?.userType === 'BUYER'
    },
    {
      name: 'My Orders',
      href: '/orders',
      icon: Receipt,
      show: user?.userType === 'BUYER'
    },
    {
      name: 'Create Event',
      href: '/events/create',
      icon: Plus,
      show: user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN'
    },
    {
      name: 'My Events',
      href: '/organizer',
      icon: BarChart3,
      show: user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN'
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      show: user?.userType === 'ADMIN'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      show: true
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
