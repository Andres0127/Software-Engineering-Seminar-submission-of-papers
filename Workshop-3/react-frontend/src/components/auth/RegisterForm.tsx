import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building, UserPlus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must have at least 2 characters')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .email('Please enter a valid email')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must have at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[a-z]/, 'Include at least one lowercase letter')
    .regex(/[0-9]/, 'Include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Include at least one special character'),
  confirmPassword: z.string(),
  userType: z.string(),
  phoneNumber: z.string().optional(),
  organizationName: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'BUYER'
    }
  });

  const userType = watch('userType');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error creating the account');
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-3 lg:p-4" style={{ maxHeight: '95vh', overflowY: 'auto' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-3 text-center">
          <h1 className="text-2xl font-bold mb-1" style={{ background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: '#1A1A1A' }}>
            Create account
          </h1>
          <p className="text-sm" style={{ color: '#4A4A4A' }}>
            Fill in the information to sign up
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 pb-0">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>
                Full name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '12px', height: '42px' }}>
                  <User className="h-4 w-4 transition-colors duration-200 flex-shrink-0" style={{ color: '#6B7280' }} />
                </div>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
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
              {errors.name && (
                <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1 animate-fadeIn">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-error-600"></span>
                  {errors.name.message}
                </p>
              )}
            </div>

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
                  placeholder="email@example.com"
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
                  <Lock className="h-4 w-4 transition-colors duration-200 flex-shrink-0" style={{ color: '#6B7280' }} />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
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
              {errors.password && (
                <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1 animate-fadeIn">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-error-600"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>
                Confirm password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '12px', height: '42px' }}>
                  <Lock className="h-4 w-4 transition-colors duration-200 flex-shrink-0" style={{ color: '#6B7280' }} />
                </div>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
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
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1 animate-fadeIn">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-error-600"></span>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>
                Phone <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '12px', height: '42px' }}>
                  <Phone className="h-4 w-4 transition-colors duration-200 flex-shrink-0" style={{ color: '#6B7280' }} />
                </div>
                <input
                  {...register('phoneNumber')}
                  id="phoneNumber"
                  type="tel"
                  placeholder="+57 300 123 4567"
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
              {errors.phoneNumber && (
                <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1 animate-fadeIn">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-error-600"></span>
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* User Type Select */}
            <div>
              <label htmlFor="userType" className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>
                User type
              </label>
              <div className="relative group">
                <select
                  {...register('userType')}
                  id="userType"
                  className="block w-full py-2.5 pr-10 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm hover:shadow-md appearance-none"
                  style={{ minHeight: '42px', fontSize: '14px', backgroundColor: '#FFFFFF', borderColor: '#D9DCE0', color: '#1A1A1A' } as React.CSSProperties}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0077FF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 119, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D9DCE0';
                    e.target.style.boxShadow = '';
                  }}
                >
                  <option value="BUYER">Ticket buyer</option>
                  <option value="ORGANIZER">Event organizer</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Organization Name (if organizer) */}
            {userType === 'ORGANIZER' && (
              <div className="animate-fadeIn">
                <label htmlFor="organizationName" className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>
                  Organization name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '12px', height: '42px' }}>
                    <Building className="h-4 w-4 transition-colors duration-200 flex-shrink-0" style={{ color: '#6B7280' }} />
                  </div>
                  <input
                    {...register('organizationName')}
                    id="organizationName"
                    type="text"
                    placeholder="Your company or organization name"
                    className="block w-full py-2.5 pr-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-300 hover:border-gray-300 shadow-sm hover:shadow-md focus:border-[#336D82] focus:ring-[#336D82]"
                    style={{ paddingLeft: '44px', minHeight: '42px', fontSize: '14px', backgroundColor: '#F5ECE0' }}
                  />
                </div>
                {errors.organizationName && (
                  <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1 animate-fadeIn">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-error-600"></span>
                    {errors.organizationName.message}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-0.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-2.5 px-6 rounded-xl font-semibold text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)'
                }}
              >
                {/* Shine effect on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                
                {isLoading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Create account</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Link 
              to="/login" 
              className="w-full flex items-center justify-center px-6 py-2 border-2 rounded-xl font-semibold text-sm transition-all duration-300 gap-2 group"
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
              <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Log in</span>
            </Link>
          </form>
      </div>
    </div>
  );
};
