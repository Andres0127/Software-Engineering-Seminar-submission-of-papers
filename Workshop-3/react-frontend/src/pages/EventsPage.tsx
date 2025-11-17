import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import { Event, Category, Location } from '../types';
import { EventService } from '../services/eventService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: '',
    startDate: '',
    maxPrice: ''
  });
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar eventos y categorías en paralelo
        const [eventsData, categoriesData] = await Promise.all([
          EventService.getEvents(),
          EventService.getCategories()
        ]);
        
        setEvents(eventsData);
        setCategories(categoriesData);
      } catch (error: any) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar eventos. Mostrando datos de ejemplo.');
        
        // Fallback a datos mock si la API falla
        setEvents([
          {
            id: 1,
            title: 'Conferencia de Tecnología 2025',
            description: 'Una conferencia sobre las últimas tendencias en tecnología',
            startDate: '2025-12-15T09:00:00Z',
            endDate: '2025-12-15T18:00:00Z',
            maxAttendees: 500,
            ticketPrice: 150000,
            status: 'PUBLISHED',
            categoryId: 1,
            locationId: 1,
            organizerId: 1,
            category: { id: 1, name: 'Tecnología', description: 'Eventos tecnológicos' },
            location: { id: 1, name: 'Centro de Convenciones', address: 'Calle 123 #45-67', capacity: 500 }
          },
          {
            id: 2,
            title: 'Concierto de Jazz',
            description: 'Una noche mágica con los mejores artistas de jazz',
            startDate: '2025-12-20T20:00:00Z',
            endDate: '2025-12-20T23:00:00Z',
            maxAttendees: 300,
            ticketPrice: 80000,
            status: 'PUBLISHED',
            categoryId: 2,
            locationId: 2,
            organizerId: 2,
            category: { id: 2, name: 'Música', description: 'Eventos musicales' },
            location: { id: 2, name: 'Teatro Municipal', address: 'Carrera 56 #78-90', capacity: 300 }
          }
        ]);
        
        setCategories([
          { id: 1, name: 'Tecnología', description: 'Eventos tecnológicos' },
          { id: 2, name: 'Música', description: 'Eventos musicales' },
          { id: 3, name: 'Deportes', description: 'Eventos deportivos' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = async () => {
    try {
      setLoading(true);
      const filteredEvents = await EventService.getEvents({
        categoryId: filters.categoryId ? parseInt(filters.categoryId) : undefined,
        startDate: filters.startDate || undefined,
        // Note: maxPrice filter would need to be implemented in backend
      });
      setEvents(filteredEvents);
    } catch (error: any) {
      toast.error('Error al filtrar eventos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '400px', gap: '24px' }}>
        <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Cargando eventos...
          </h3>
          <p className="text-gray-600">
            Preparando las mejores experiencias para ti
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Eventos
          </h1>
          <p className="text-gray-600 mt-2">
            Descubre experiencias increíbles cerca de ti
          </p>
        </div>
        
        {(user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN') && (
          <Link
            to="/events/create"
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Evento
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="card p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Filtrar Eventos</h3>
          <p className="text-gray-600">Encuentra exactamente lo que buscas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="label">
              Categoría
            </label>
            <select 
              value={filters.categoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
              className="select"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">
              Fecha
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="input"
            />
          </div>
          
          <div>
            <label className="label">
              Precio máximo
            </label>
            <input
              type="number"
              placeholder="Ingresa monto"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              className="input"
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleFilterChange}
              className="btn-primary w-full"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            {/* Imagen del evento */}
            <div className="event-image">
              <div className="event-badge">
                {event.category?.name || 'General'}
              </div>
              <div className="event-price">
                {formatPrice(event.ticketPrice)}
              </div>
              <Calendar className="w-12 h-12 text-white" />
            </div>

            <div className="p-6">
              {/* Título y descripción */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {event.title}
              </h3>
              <p className="text-gray-600 mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {event.description.length > 120 
                  ? `${event.description.substring(0, 120)}...` 
                  : event.description
                }
              </p>

              {/* Información del evento */}
              <div className="space-y-3 mb-6">
                <div className="info-item">
                  <Calendar className="info-icon" />
                  <div>
                    <div className="info-label">Fecha</div>
                    <div className="info-value">
                      {formatDate(event.startDate)}
                    </div>
                  </div>
                </div>
                
                <div className="info-item">
                  <MapPin className="info-icon" />
                  <div>
                    <div className="info-label">Ubicación</div>
                    <div className="info-value">
                      {event.location?.name || 'Por definir'}
                    </div>
                  </div>
                </div>
                
                <div className="info-item">
                  <Users className="info-icon" />
                  <div>
                    <div className="info-label">Capacidad</div>
                    <div className="info-value">
                      {event.maxAttendees} personas
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <Link
                  to={`/events/${event.id || 'unknown'}`}
                  className="btn-secondary flex-1"
                >
                  Ver Detalles
                </Link>
                <Link
                  to={`/events/${event.id || 'unknown'}/tickets`}
                  className="btn-primary"
                >
                  Comprar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="card text-center py-16">
          <div className="mb-6" style={{ margin: '0 auto 24px auto' }}>
            <div 
              className="rounded-full flex items-center justify-center mb-4"
              style={{ 
                width: '96px', 
                height: '96px', 
                backgroundColor: 'var(--primary-600)', 
                margin: '0 auto'
              }}
            >
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            No hay eventos disponibles
          </h3>
          <p className="text-gray-600 mb-8" style={{ maxWidth: '400px', margin: '0 auto 32px auto' }}>
            No hay eventos que coincidan con tus criterios de búsqueda.
          </p>
          
          {(user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN') && (
            <Link
              to="/events/create"
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear evento
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
