import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  email: z
    .string()
    .email('Ingrese un email válido')
    .min(1, 'El email es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
  userType: z.string(),
  phoneNumber: z.string().optional(),
  organizationName: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
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
      toast.success('Cuenta creada exitosamente');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/20 via-transparent to-pink-100/20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-28 h-28 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="glass-card p-10 animate-fadeInUp">
          {/* Logo and Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-lg">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3">
              Únete a nosotros
            </h1>
            <p className="text-lg text-gray-600">
              Crea tu cuenta en <span className="font-semibold text-purple-600">Event Platform</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Tu nombre completo"
                  className="input-modern pl-12"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="tu@email.com"
                  className="input-modern pl-12"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="input-modern pl-12"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="input-modern pl-12"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Teléfono <span className="text-gray-400">(opcional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  placeholder="+57 300 123 4567"
                  className="input-modern pl-12"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* User Type Select */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Tipo de usuario
              </label>
              <select
                {...register('userType')}
                className="input-modern"
              >
                <option value="BUYER">Comprador de tickets</option>
                <option value="ORGANIZER">Organizador de eventos</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            {/* Organization Name (if organizer) */}
            {userType === 'ORGANIZER' && (
              <div className="space-y-2 animate-fadeInUp">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Nombre de la organización
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('organizationName')}
                    type="text"
                    placeholder="Tu empresa u organización"
                    className="input-modern pl-12"
                  />
                </div>
                {errors.organizationName && (
                  <p className="text-sm text-red-500">{errors.organizationName.message}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-premium w-full justify-center text-lg py-4 group mt-8"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creando cuenta...
                </div>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <div className="ml-3 transform group-hover:scale-110 transition-transform">
                    →
                  </div>
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-4">
                ¿Ya tienes cuenta?
              </p>
              <Link 
                to="/login" 
                className="btn-secondary group"
              >
                <span>Inicia sesión</span>
                <div className="ml-2 transform group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
