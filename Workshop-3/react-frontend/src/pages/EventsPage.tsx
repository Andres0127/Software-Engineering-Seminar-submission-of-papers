import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Plus, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Event, Category, Location } from '../types';
import { EventService } from '../services/eventService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    locationId: '',
    startDate: '',
    endDate: '',
    maxPrice: ''
  });
  const { user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load events and categories in parallel
        // Request more events to ensure we get newly created ones (max 50 per backend limit)
        const [eventsData, categoriesData, locationsData] = await Promise.all([
          EventService.getEvents({ limit: 50, page: 1 }),
          EventService.getCategories(),
          EventService.getLocations()
        ]);

        console.log('Events loaded:', eventsData);
        console.log('Number of events:', eventsData?.length || 0);
        // Log first few events to verify ordering
        if (eventsData && eventsData.length > 0) {
          console.log('First 3 events:', eventsData.slice(0, 3).map(e => ({ id: e.id, title: e.title })));
        }
        
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
  }, [location.pathname]); // Reload when navigating to this page

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
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div 
          className="relative w-20 h-20 mb-8"
          style={{
            animation: 'spin 1s linear infinite'
          }}
        >
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)',
              opacity: 0.2
            }}
          />
          <div 
            className="absolute inset-2 rounded-full bg-white"
          />
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: '#0077FF',
              borderRightColor: '#6A40FF'
            }}
          />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-eventify-blue via-eventify-purple to-eventify-pink bg-clip-text text-transparent mb-2">
            Loading amazing events...
          </h3>
          <p className="text-gray-600 text-lg">
            Preparing the best experiences for you ✨
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-eventify-blue via-eventify-purple to-eventify-pink bg-clip-text text-transparent mb-2">
            Discover Events
          </h1>
          <p className="text-lg text-gray-600">
            Find incredible experiences and unforgettable moments ✨
          </p>
        </div>
        
        {(user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN') && (
          <Link
            to="/events/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)'
            }}
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        )}
      </div>

      {/* Filtros - Desplegable */}
      <div 
        className="rounded-2xl overflow-hidden shadow-md border"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 119, 255, 0.02) 0%, rgba(106, 64, 255, 0.02) 100%)',
          borderColor: 'rgba(0, 119, 255, 0.1)'
        }}
      >
        {/* Header clickeable */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full p-6 flex items-center justify-between hover:bg-white/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
              style={{
                background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)'
              }}
            >
              <Filter className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900">Filter & Search</h3>
              <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
            </div>
          </div>
          <div 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              filtersOpen ? 'bg-eventify-blue' : 'bg-gray-100'
            }`}
          >
            {filtersOpen ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-eventify-blue" />
            )}
          </div>
        </button>

        {/* Contenido desplegable */}
        {filtersOpen && (
          <div className="px-6 pb-6 space-y-6 border-t" style={{ borderColor: '#D9DCE0' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-6">
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
                <button 
                  onClick={handleFilterChange} 
                  className="w-full px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)'
                  }}
                >
                  Apply Filters
                </button>
                <button 
                  onClick={handleClearFilters} 
                  className="w-full px-6 py-3 rounded-xl font-bold border-2 border-gray-300 text-gray-700 hover:border-eventify-blue hover:text-eventify-blue hover:bg-eventify-blue/5 transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <div 
            key={event.id} 
            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fadeIn border border-gray-100"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Event image with gradient overlay */}
            <div 
              className="relative h-48 flex items-center justify-center overflow-hidden"
              style={{
                background: index % 3 === 0 
                  ? 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)'
                  : index % 3 === 1
                  ? 'linear-gradient(135deg, #6A40FF 0%, #FF3399 100%)'
                  : 'linear-gradient(135deg, #FF3399 0%, #0077FF 100%)'
              }}
            >
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
              </div>
              
              {/* Category badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
                <span className="text-xs font-semibold text-white uppercase tracking-wide">
                  {event.category?.name || 'General'}
                </span>
              </div>
              
              {/* Price tag */}
              <div className="absolute top-4 right-4 px-4 py-2 bg-white rounded-full shadow-lg">
                <span className="text-sm font-bold bg-gradient-to-r from-eventify-blue to-eventify-purple bg-clip-text text-transparent">
                  {formatPrice(event.ticketPrice)}
                </span>
              </div>
              
              {/* Icon */}
              <Calendar className="w-20 h-20 text-white opacity-40 group-hover:scale-110 transition-transform duration-300" />
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {/* Title */}
              <h3 className="text-xl font-bold mb-3 leading-tight text-gray-900 group-hover:text-eventify-blue transition-colors">
                {event.title}
              </h3>
              
              {/* Description */}
              <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                {event.description.length > 120 
                  ? `${event.description.substring(0, 120)}...` 
                  : event.description
                }
              </p>

              {/* Event information */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-eventify-blue/10 to-eventify-purple/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-eventify-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Date</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {formatDate(event.startDate)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-eventify-purple/10 to-eventify-pink/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-eventify-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Location</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {event.location?.name || 'To be defined'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-eventify-pink/10 to-eventify-blue/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-eventify-pink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Capacity</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {event.maxAttendees} people
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 mt-auto">
                <Link
                  to={`/events/${event.id || 'unknown'}`}
                  className="flex-1 text-center px-4 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:border-eventify-blue hover:text-eventify-blue hover:bg-eventify-blue/5 transition-all"
                >
                  View details
                </Link>
                {user?.userType === 'BUYER' && (
                  <Link
                    to={`/events/${event.id || 'unknown'}/tickets`}
                    className="px-6 py-2.5 rounded-xl font-semibold text-white hover:shadow-lg transition-all transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)'
                    }}
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
        <div 
          className="text-center py-20 px-6 animate-fadeIn rounded-2xl border-2 border-dashed"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 119, 255, 0.03) 0%, rgba(106, 64, 255, 0.03) 100%)',
            borderColor: 'rgba(0, 119, 255, 0.2)'
          }}
        >
          <div className="mb-8 mx-auto w-fit">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 transform hover:scale-110 transition-transform"
              style={{ 
                background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)'
              }}
            >
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            No events found
          </h3>
          <p className="text-lg text-gray-600 mb-8 mx-auto" style={{ maxWidth: '500px' }}>
            We couldn't find any events matching your criteria. Try adjusting your filters or create a new event!
          </p>
          
          {(user?.userType === 'ORGANIZER' || user?.userType === 'ADMIN') && (
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 100%)'
              }}
            >
              <Plus className="w-6 h-6" />
              Create Your First Event
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
