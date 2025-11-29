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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
          style={{ transition: 'opacity 0.3s ease' }}
        />
      )}
      
      <div 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        style={{ 
          width: '280px', 
          minHeight: 'calc(100vh - 73px)', 
          position: 'sticky', 
          top: '73px', 
          maxHeight: 'calc(100vh - 73px)', 
          overflowY: 'auto'
        }}
      >
        <div className="p-6">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navigation
              .filter(item => item.show)
              .map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
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
    </>
  );
};
