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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-elevated p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Crear cuenta
            </h1>
            <p className="text-gray-600">
              Complete la información para registrarse
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="label">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Ingrese su nombre completo"
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
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="correo@ejemplo.com"
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
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
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
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Repita su contraseña"
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
                Teléfono <span className="text-muted">(opcional)</span>
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
                Tipo de usuario
              </label>
              <select
                {...register('userType')}
                className="select"
              >
                <option value="BUYER">Comprador de tickets</option>
                <option value="ORGANIZER">Organizador de eventos</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            {/* Organization Name (if organizer) */}
            {userType === 'ORGANIZER' && (
              <div className="animate-fadeIn">
                <label className="label">
                  Nombre de la organización
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('organizationName')}
                    type="text"
                    placeholder="Nombre de su empresa u organización"
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
                    Creando cuenta...
                  </div>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                ¿Ya tiene una cuenta?
              </p>
              <Link 
                to="/login" 
                className="btn-outline"
              >
                Iniciar sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
