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
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    locationId: '',
    startDate: '',
    endDate: '',
    maxPrice: ''
  });
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load events and categories in parallel
        const [eventsData, categoriesData, locationsData] = await Promise.all([
          EventService.getEvents(),
          EventService.getCategories(),
          EventService.getLocations()
        ]);

        setEvents(eventsData);
        setCategories(categoriesData);
        setLocations(locationsData);
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error('Unable to load events. Showing curated samples.');

        setEvents([
          {
            id: 1,
            title: 'Global Innovation Summit 2026',
            description: 'A forum exploring AI, sustainability, and digital leadership.',
            startDate: '2026-03-15T09:00:00Z',
            endDate: '2026-03-15T18:00:00Z',
            maxAttendees: 800,
            ticketPrice: 299000,
            status: 'PUBLISHED',
            categoryId: 1,
            locationId: 1,
            organizerId: 1,
            category: { id: 1, name: 'Technology', description: 'Conferences about emerging technology and innovation.' },
            location: { id: 1, name: 'Innovation Hall', address: '123 Tech Blvd, Boston, MA 02110', capacity: 800 }
          },
          {
            id: 2,
            title: 'Cityscape Marketing Forum',
            description: 'Leadership sessions on storytelling, analytics, and growth strategy.',
            startDate: '2026-05-20T10:00:00Z',
            endDate: '2026-05-20T17:30:00Z',
            maxAttendees: 600,
            ticketPrice: 225000,
            status: 'PUBLISHED',
            categoryId: 2,
            locationId: 2,
            organizerId: 2,
            category: { id: 2, name: 'Business', description: 'Summits covering strategy, finance, and leadership.' },
            location: { id: 2, name: 'Summit Center', address: '450 Business Way, Chicago, IL 60601', capacity: 600 }
          },
          {
            id: 3,
            title: 'Harmony Music Expedition',
            description: 'An immersive music festival celebrating acoustic experiences.',
            startDate: '2026-08-10T16:00:00Z',
            endDate: '2026-08-10T23:00:00Z',
            maxAttendees: 400,
            ticketPrice: 149000,
            status: 'PUBLISHED',
            categoryId: 3,
            locationId: 3,
            organizerId: 3,
            category: { id: 3, name: 'Music', description: 'Live performances and curated concerts.' },
            location: { id: 3, name: 'Harmony Garden', address: '89 Concert Avenue, Austin, TX 73301', capacity: 400 }
          }
        ]);

        setLocations([
          { id: 1, name: 'Innovation Hall', address: '123 Tech Blvd, Boston, MA 02110', capacity: 800 },
          { id: 2, name: 'Summit Center', address: '450 Business Way, Chicago, IL 60601', capacity: 600 },
          { id: 3, name: 'Harmony Garden', address: '89 Concert Avenue, Austin, TX 73301', capacity: 400 }
        ]);
        setCategories([
          { id: 1, name: 'Technology', description: 'Conferences about emerging technology and innovation.' },
          { id: 2, name: 'Business', description: 'Summits covering strategy, finance, and leadership.' },
          { id: 3, name: 'Music', description: 'Live performances and curated showcases.' }
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
        search: filters.search || undefined,
        categoryId: filters.categoryId ? parseInt(filters.categoryId) : undefined,
        locationId: filters.locationId ? parseInt(filters.locationId) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined
      });
      setEvents(filteredEvents);
    } catch (error: any) {
      toast.error('Unable to filter events.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      locationId: '',
      startDate: '',
      endDate: '',
      maxPrice: ''
    });
    handleFilterChange();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '400px', gap: '24px' }}>
        <div className="loading-spinner mx-auto" style={{ width: '48px', height: '48px', borderWidth: '4px', borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}></div>
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Loading events...
          </h3>
          <p className="text-gray-600">
            Preparing the best experiences for you
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
            Events
          </h1>
          <p className="text-gray-600 mt-2">
            Discover incredible experiences near you
          </p>
        </div>
        
        {(user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN') && (
          <Link
            to="/events/create"
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="card p-8 space-y-6">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Filter events</h3>
          <p className="text-gray-600">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              type="search"
              placeholder="Keywords, titles, venues..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">Location</label>
            <select
              value={filters.locationId}
              onChange={(e) => setFilters((prev) => ({ ...prev, locationId: e.target.value }))}
              className="select"
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id.toString()}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="select"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Start date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label className="label">End date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Max price</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={filters.maxPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
              className="input"
            />
          </div>

          <div className="md:col-span-2 flex items-end gap-3">
            <button onClick={handleFilterChange} className="btn-primary w-full">
              Filter
            </button>
            <button onClick={handleClearFilters} className="btn-outline w-full">
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Events list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <div 
            key={event.id} 
            className="event-card animate-fadeIn"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Event image */}
            <div className="event-image">
              <div className="event-badge">
                {event.category?.name || 'General'}
              </div>
              <div className="event-price">
                {formatPrice(event.ticketPrice)}
              </div>
              <Calendar className="w-12 h-12 text-white" style={{ opacity: 0.3 }} />
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {/* Title and description */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                {event.title}
              </h3>
              <p className="text-gray-600 mb-4 flex-1" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {event.description.length > 120 
                  ? `${event.description.substring(0, 120)}...` 
                  : event.description
                }
              </p>

              {/* Event information */}
              <div className="space-y-3 mb-6">
                <div className="info-item">
                  <Calendar className="info-icon" />
                  <div>
                    <div className="info-label">Date</div>
                    <div className="info-value">
                      {formatDate(event.startDate)}
                    </div>
                  </div>
                </div>
                
                <div className="info-item">
                  <MapPin className="info-icon" />
                  <div>
                    <div className="info-label">Location</div>
                    <div className="info-value">
                      {event.location?.name || 'To be defined'}
                    </div>
                  </div>
                </div>
                
                <div className="info-item">
                  <Users className="info-icon" />
                  <div>
                    <div className="info-label">Capacity</div>
                    <div className="info-value">
                      {event.maxAttendees} people
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 mt-auto">
                <Link
                  to={`/events/${event.id || 'unknown'}`}
                  className="btn-secondary flex-1 text-center"
                >
                  View details
                </Link>
                {user?.userType === 'BUYER' && (
                  <Link
                    to={`/events/${event.id || 'unknown'}/tickets`}
                    className="btn-primary"
                  >
                    Buy
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="card text-center py-16 animate-fadeIn">
          <div className="mb-6" style={{ margin: '0 auto 24px auto' }}>
            <div 
              className="rounded-full flex items-center justify-center mb-4 mx-auto"
              style={{ 
                width: '96px', 
                height: '96px', 
                backgroundColor: 'var(--primary-600)', 
              }}
            >
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            No events available
          </h3>
          <p className="text-gray-600 mb-8 mx-auto" style={{ maxWidth: '400px' }}>
            There are no events matching your filters.
          </p>
          
          {(user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN') && (
            <Link
              to="/events/create"
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
