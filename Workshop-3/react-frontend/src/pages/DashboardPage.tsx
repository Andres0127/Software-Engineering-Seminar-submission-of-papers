import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, 
  Ticket, 
  BarChart3,
  Users,
  MapPin,
  TrendingUp,
  Settings,
  Eye
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Total Eventos',
      value: '12',
      icon: Calendar,
      trend: '+12%',
      color: '#1e293b'
    },
    {
      title: 'Tickets Vendidos',
      value: '1,248',
      icon: Ticket,
      trend: '+28%',
      color: '#059669'
    },
    {
      title: 'Usuarios Activos',
      value: '856',
      icon: Users,
      trend: '+15%',
      color: '#d97706'
    },
    {
      title: 'Ubicaciones',
      value: '8',
      icon: MapPin,
      trend: '+2%',
      color: '#dc2626'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)',
        borderRadius: 'var(--border-radius-xl)',
        padding: '40px',
        color: 'var(--white)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="text-4xl font-bold mb-2">
            ¡Bienvenido, {user?.name}!
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            Aquí tienes un resumen de tu plataforma de eventos.
          </p>
          <div className="mt-4">
            <span className="badge" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              color: 'var(--white)',
              textTransform: 'capitalize'
            }}>
              {user?.userType === 'BUYER' && 'Comprador'}
              {user?.userType === 'ORGANIZER' && 'Organizador'} 
              {user?.userType === 'ADMIN' && 'Administrador'}
            </span>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card-elevated p-6" style={{ position: 'relative', overflow: 'hidden' }}>
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className="flex items-center" style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                backgroundColor: `${stat.color}10`,
                borderRadius: '50%'
              }}></div>
            </div>
          );
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-8 text-center hover:shadow-md transition-all">
          <div 
            className="rounded-full flex items-center justify-center mb-6"
            style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: 'var(--primary-100)', 
              margin: '0 auto'
            }}
          >
            <Calendar className="w-8 h-8" style={{ color: 'var(--primary-600)' }} />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Gestionar Eventos
          </h3>
          <p className="text-gray-600 mb-6">
            Crea, edita y administra tus eventos
          </p>
          <Link to="/events" className="btn-primary w-full">
            <Eye className="w-5 h-5 mr-2" />
            Ver Eventos
          </Link>
        </div>

        <div className="card p-8 text-center hover:shadow-md transition-all">
          <div 
            className="rounded-full flex items-center justify-center mb-6"
            style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#d1fae520', 
              margin: '0 auto'
            }}
          >
            <BarChart3 className="w-8 h-8" style={{ color: 'var(--success-600)' }} />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Reportes
          </h3>
          <p className="text-gray-600 mb-6">
            Analiza el rendimiento de tus eventos
          </p>
          <button className="btn-secondary w-full">
            <BarChart3 className="w-5 h-5 mr-2" />
            Ver Reportes
          </button>
        </div>

        <div className="card p-8 text-center hover:shadow-md transition-all">
          <div 
            className="rounded-full flex items-center justify-center mb-6"
            style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: 'var(--gray-100)', 
              margin: '0 auto'
            }}
          >
            <Settings className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Configuración
          </h3>
          <p className="text-gray-600 mb-6">
            Personaliza tu cuenta y preferencias
          </p>
          <Link to="/settings" className="btn-outline w-full">
            <Settings className="w-5 h-5 mr-2" />
            Configurar
          </Link>
        </div>
      </div>

      {/* User Information Card */}
      <div className="card-elevated p-8">
        <div className="flex items-center mb-6">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
            style={{ backgroundColor: 'var(--primary-600)' }}
          >
            <span className="text-white font-semibold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              Información del Usuario
            </h3>
            <p className="text-gray-600">
              Detalles de tu cuenta y configuración
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="label">Email</span>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <span className="label">Rol</span>
              <p className="text-gray-900 font-medium">ROLE_ORGANIZER</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <span className="label">Estado</span>
              <p className="text-success font-medium">ACTIVE</p>
            </div>
            {user?.organizationName && (
              <div>
                <span className="label">Organización</span>
                <p className="text-gray-900 font-medium">{user.organizationName}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
