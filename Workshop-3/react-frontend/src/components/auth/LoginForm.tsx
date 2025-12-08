import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, Ticket, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Unable to log in');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left Side - Branding and Info */}
      <div 
        className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #0077FF 100%)'
        }}
      >
        {/* Animated decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full -mr-40 -mt-40 animate-pulse" 
             style={{ backgroundColor: '#0077FF', opacity: 0.1, animationDuration: '5s' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full -ml-40 -mb-40 animate-pulse" 
             style={{ backgroundColor: '#0077FF', opacity: 0.1, animationDuration: '7s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" 
             style={{ backgroundColor: '#0077FF', opacity: 0.05 }}></div>
        
        {/* Logo and Title Section */}
        <div className="relative z-10">
          {/* Eventify Logo - Prominent */}
          <div className="mb-5 flex items-center space-x-3">
            <img 
              src="/Eventify.png" 
              alt="Eventify" 
              className="h-12 w-auto drop-shadow-lg"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-2 leading-tight" style={{ color: '#0077FF' }}>
            Welcome to Eventify
          </h1>
          <p className="text-base leading-relaxed mb-5" style={{ color: '#4A4A4A' }}>
            The complete platform for creating, managing, and scaling your events with powerful tools and insights.
          </p>
        </div>

        {/* Features Section */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-start space-x-4 group">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-all duration-300 shadow-lg" style={{ backgroundColor: '#E5D9FF' }}>
              <Calendar className="w-6 h-6" style={{ color: '#0077FF' }} />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: '#1A1A1A' }}>Event Management</h3>
              <p className="text-sm" style={{ color: '#4A4A4A' }}>Create and manage events with ease</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 group">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-all duration-300 shadow-lg" style={{ backgroundColor: '#E5D9FF' }}>
              <Ticket className="w-6 h-6" style={{ color: '#0077FF' }} />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: '#1A1A1A' }}>Ticket Sales</h3>
              <p className="text-sm" style={{ color: '#4A4A4A' }}>Sell tickets with integrated payment processing</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 group">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-all duration-300 shadow-lg" style={{ backgroundColor: '#E5D9FF' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#0077FF' }} />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: '#1A1A1A' }}>Analytics Dashboard</h3>
              <p className="text-sm" style={{ color: '#4A4A4A' }}>Track performance with real-time insights</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: '#4A4A4A' }}>
            © 2025 Eventify. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-5">
            <div className="flex items-center space-x-3">
              <img 
                src="/Eventify.png" 
                alt="Eventify" 
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: '#1A1A1A' }}>
              Welcome back
            </h2>
            <p className="text-base" style={{ color: '#4A4A4A' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '12px', height: '42px' }}>
                  <Mail className="h-4 w-4 transition-colors duration-200 flex-shrink-0" style={{ color: '#6B7280' }} />
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  defaultValue="admin@eventplatform.com"
                  placeholder="you@example.com"
                  className="block w-full py-2.5 pr-4 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm hover:shadow-md"
                  style={{ paddingLeft: '44px', minHeight: '42px', fontSize: '14px', backgroundColor: '#FFFFFF', borderColor: '#D9DCE0', color: '#1A1A1A' } as React.CSSProperties}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0077FF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 255, 0.1)';
                    const icon = e.target.previousElementSibling?.querySelector('svg');
                    if (icon) icon.style.color = '#0077FF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D9DCE0';
                    e.target.style.boxShadow = '';
                    const icon = e.target.previousElementSibling?.querySelector('svg');
                    if (icon) icon.style.color = '#6B7280';
                  }}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1 animate-fadeIn">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-error-600"></span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '12px', height: '42px' }}>
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200 flex-shrink-0" />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="block w-full py-2.5 pr-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-300 hover:border-gray-300 shadow-sm hover:shadow-md focus:border-[#336D82] focus:ring-[#336D82]"
                  style={{ paddingLeft: '44px', minHeight: '42px', fontSize: '14px', backgroundColor: '#F5ECE0' }}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1 animate-fadeIn">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-error-600"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-50 border-l-4 border-error-500 p-4 rounded-lg animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-error-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-error-700 font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)'
              }}
            >
              {/* Shine effect on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              
              {isLoading ? (
                <>
                  <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign in</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-medium">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link 
            to="/register" 
            className="w-full flex items-center justify-center px-6 py-2.5 border-2 rounded-xl font-semibold text-sm transition-all duration-300 gap-2 group"
            style={{ borderColor: '#D9DCE0', color: '#4A4A4A' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0077FF';
              e.currentTarget.style.color = '#0077FF';
              e.currentTarget.style.backgroundColor = '#F2F4F7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D9DCE0';
              e.currentTarget.style.color = '#4A4A4A';
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Create an account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
