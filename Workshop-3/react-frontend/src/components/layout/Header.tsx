import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, Menu, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import NotificationPanel from '../notifications/NotificationPanel';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error during logout');
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  return (
    <header 
      className="sticky top-0 z-30 border-b backdrop-blur-sm"
      style={{ 
        background: 'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
        borderBottom: '1px solid rgba(0, 119, 255, 0.1)',
        boxShadow: '0 2px 20px rgba(0, 119, 255, 0.08)'
      }}
    >
      <div className="px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 md:hidden rounded-lg hover:bg-eventify-blue/5 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5 text-eventify-blue" />
              </button>
            )}
            
            <Link 
              to="/events" 
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <img 
                  src="/Eventify.png" 
                  alt="Eventify" 
                  className="h-16 w-auto drop-shadow-lg transition-transform group-hover:scale-105"
                />
                <div 
                  className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 119, 255, 0.1) 0%, rgba(106, 64, 255, 0.1) 100%)',
                    filter: 'blur(10px)',
                    zIndex: -1
                  }}
                />
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-eventify-blue/60 uppercase tracking-wider">
                  Event Platform
                </div>
                <div className="text-lg font-bold bg-gradient-to-r from-eventify-blue to-eventify-purple bg-clip-text text-transparent">
                  Eventify
                </div>
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <NotificationPanel />

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl transition-all hover:shadow-md"
                  style={{
                    background: isUserMenuOpen 
                      ? 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)'
                      : 'transparent',
                    border: '2px solid transparent',
                    borderImage: isUserMenuOpen ? 'none' : 'linear-gradient(135deg, #0077FF, #6A40FF) 1'
                  }}
                >
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg" 
                    style={{ background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)' }}
                  >
                    <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className={`text-sm font-semibold ${isUserMenuOpen ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </span>
                    <span className={`text-xs ${isUserMenuOpen ? 'text-white/80' : 'text-gray-500'}`}>
                      {user.userType === 'BUYER' && 'Buyer'}
                      {user.userType === 'ORGANIZER' && 'Organizer'}
                      {user.userType === 'ADMIN' && 'Admin'}
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      isUserMenuOpen ? 'rotate-180 text-white' : 'text-gray-500'
                    }`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={closeUserMenu}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                      <div className="py-2">
                        {/* User Info */}
                        <div 
                          className="px-4 py-4 mb-2"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0, 119, 255, 0.05) 0%, rgba(106, 64, 255, 0.05) 100%)'
                          }}
                        >
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={closeUserMenu}
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-eventify-blue/5 hover:to-eventify-purple/5 transition-all rounded-lg mx-2"
                          >
                            <User className="w-4 h-4 mr-3 text-eventify-blue" />
                            My Profile
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 pt-2 pb-1 mt-2">
                          <button
                            onClick={() => {
                              closeUserMenu();
                              handleLogout();
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all rounded-lg mx-2"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Log out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
