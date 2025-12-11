import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Ticket, 
  Users, 
  BarChart3, 
  Plus,
  Receipt,
  User
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
      name: 'My Profile',
      href: '/profile',
      icon: User,
      show: user?.userType === 'BUYER'
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
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:sticky top-[73px] left-0 z-40 md:z-auto transition-transform duration-300 ease-in-out`}
        style={{ 
          width: '280px', 
          minHeight: 'calc(100vh - 73px)', 
          maxHeight: 'calc(100vh - 73px)', 
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #0077FF 0%, #6A40FF 100%)',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="p-6">
          {/* Navigation Label */}
          <div className="mb-6">
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">
              Navigation
            </h3>
          </div>

          <nav className="flex flex-col gap-2">
            {navigation
              .filter(item => item.show)
              .map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-eventify-blue shadow-lg transform scale-105'
                        : 'text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`flex-shrink-0 ${isActive ? 'text-eventify-blue' : 'text-white/80 group-hover:text-white'}`}>
                        <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                        {item.name}
                      </span>
                      {isActive && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-eventify-blue rounded-full" />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
          </nav>

          {/* Footer Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm">
              <p className="text-white/60 text-xs font-medium mb-1">Eventify Pro</p>
              <p className="text-white text-sm font-semibold">
                {user?.userType === 'ADMIN' && '🎯 Admin Access'}
                {user?.userType === 'ORGANIZER' && '🎪 Event Organizer'}
                {user?.userType === 'BUYER' && '🎫 Event Explorer'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
