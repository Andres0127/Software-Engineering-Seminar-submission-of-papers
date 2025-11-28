import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-elevated p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Create account
            </h1>
            <p className="text-gray-600">
              Fill in the information to sign up
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="label">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Enter your full name"
                  className="input pl-10"
                />
              </div>
              {errors.name && (
                <p className="text-error">{errors.name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="label">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="email@example.com"
                  className="input pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="label">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="input pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="label">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Repeat your password"
                  className="input pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label className="label">
                Phone <span className="text-muted">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  placeholder="+57 300 123 4567"
                  className="input pl-10"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-error">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* User Type Select */}
            <div>
              <label className="label">
                User type
              </label>
              <select
                {...register('userType')}
                className="select"
              >
                <option value="BUYER">Ticket buyer</option>
                <option value="ORGANIZER">Event organizer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Organization Name (if organizer) */}
            {userType === 'ORGANIZER' && (
              <div className="animate-fadeIn">
                <label className="label">
                  Organization name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('organizationName')}
                    type="text"
                  placeholder="Your company or organization name"
                    className="input pl-10"
                  />
                </div>
                {errors.organizationName && (
                  <p className="text-error">{errors.organizationName.message}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      Creating account...
                    </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Already have an account?
              </p>
              <Link 
                to="/login" 
                className="btn-outline"
              >
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
