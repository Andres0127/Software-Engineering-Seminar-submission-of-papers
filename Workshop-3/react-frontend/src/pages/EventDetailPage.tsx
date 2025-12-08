import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Tag, 
  ArrowLeft, 
  Share2,
  Heart,
  ShoppingCart,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Event } from '../types';
import { EventService } from '../services/eventService';
import { UserService } from '../services/userService';
import { useAuthStore } from '../store/authStore';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizerName, setOrganizerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
      setError('Invalid event ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventData = await EventService.getEventById(parseInt(id));
        console.log('Event data received:', eventData);
        console.log('Organizer name:', eventData.organizerName);
        console.log('Organizer ID:', eventData.organizerId);
        setEvent(eventData);
        
        // If organizer name is not provided, try to fetch from Java backend
        if (!eventData.organizerName && eventData.organizerId && user?.userType === 'ADMIN') {
          try {
            const organizerInfo = await UserService.getUserById(eventData.organizerId);
            console.log('Organizer info from Java backend:', organizerInfo);
            setOrganizerName(organizerInfo.name);
          } catch (err) {
            console.error('Error fetching organizer info:', err);
          }
        } else if (eventData.organizerName) {
          setOrganizerName(eventData.organizerName);
        }
      } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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

  const handleDeleteEvent = async () => {
    if (!event || !window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await EventService.deleteEvent(event.id);
      toast.success('Event deleted successfully');
      navigate('/organizer');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleShareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const canEditEvent = user && event && (
    user.userType === 'ADMIN' || 
    (user.userType === 'ORGANIZER' && event.organizerId === user.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" style={{ width: '48px', height: '48px', borderWidth: '4px', borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Event not found'}
          </h1>
          <Link
            to="/events"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to events</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to events</span>
        </Link>

        <div className="flex items-center space-x-3">
            <button
              onClick={handleShareEvent}
              className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

          {canEditEvent && (
            <div className="flex space-x-2">
              <Link
                to={`/events/${event.id}/edit`}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Link>
              
              <button
                onClick={handleDeleteEvent}
                className="btn-secondary inline-flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Event header */}
      <div className="card p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="badge-primary inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                {event.category?.name}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'PUBLISHED' 
                  ? 'bg-blue-100 text-blue-600' 
                  : event.status === 'DRAFT'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {event.status === 'PUBLISHED' ? 'Published' : 
                 event.status === 'DRAFT' ? 'Draft' : 'Canceled'}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              {event.title}
            </h1>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold mb-2" style={{ color: '#FF3399' }}>
              {formatPrice(event.ticketPrice)}
            </div>
            <div className="text-sm" style={{ color: '#4A4A4A' }}>per person</div>
          </div>
        </div>

        {/* Key event information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="info-item">
            <Calendar className="w-6 h-6" style={{ marginTop: '2px', color: '#0077FF' }} />
            <div>
              <div className="info-label">Start date</div>
              <div className="info-value">{formatDate(event.startDate)}</div>
            </div>
          </div>

          <div className="info-item">
            <Clock className="w-6 h-6" style={{ marginTop: '2px', color: '#0077FF' }} />
            <div>
              <div className="info-label">End date</div>
              <div className="info-value">{formatDate(event.endDate)}</div>
            </div>
          </div>

          <div className="info-item">
            <MapPin className="w-6 h-6" style={{ marginTop: '2px', color: '#0077FF' }} />
            <div>
              <div className="info-label">{event.location?.name}</div>
              <div className="info-value">{event.location?.address}</div>
            </div>
          </div>

          <div className="info-item">
            <Users className="w-6 h-6" style={{ marginTop: '2px', color: '#0077FF' }} />
            <div>
              <div className="info-label">Capacity</div>
              <div className="info-value">{event.maxAttendees} people</div>
            </div>
          </div>
        </div>

        {/* Main purchase button */}
        {event.status === 'PUBLISHED' && user?.userType === 'BUYER' && (
          <div className="text-center">
            <Link
              to={`/events/${event.id}/tickets`}
              className="btn-primary inline-flex items-center space-x-3 px-8 py-4 text-lg font-semibold"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Buy tickets</span>
            </Link>
          </div>
        )}
      </div>

      {/* Event description */}
      <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>About this event</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>
      </div>

      {/* Additional information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Location */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: '#1A1A1A' }}>
            <MapPin className="w-6 h-6 mr-2" style={{ color: '#336D82' }} />
            Location
          </h3>
          <div className="space-y-2">
            <div className="font-medium" style={{ color: '#1A1A1A' }}>{event.location?.name}</div>
            <div style={{ color: '#4A4A4A' }}>{event.location?.address}</div>
            <div className="text-sm" style={{ color: '#4A4A4A' }}>
              Capacity: {event.location?.capacity} attendees
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: '#1A1A1A' }}>
            <Users className="w-6 h-6 mr-2" style={{ color: '#336D82' }} />
            Organizer
          </h3>
          <div className="space-y-2">
            <div className="font-medium" style={{ color: '#1A1A1A' }}>
              {organizerName || event.organizerName || `Organizer #${event.organizerId}`}
            </div>
            <div style={{ color: '#4A4A4A' }}>Contact information available after purchase</div>
          </div>
        </div>
      </div>

      {/* Ticket zones */}
      {event.ticketTypes && event.ticketTypes.length > 0 && (
        <div className="card p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold" style={{ color: '#1A1A1A' }}>Ticket zones</h3>
            <span className="text-sm" style={{ color: '#4A4A4A' }}>
              {event.ticketTypes.length} options
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.ticketTypes.map((zone) => (
              <div
                key={zone.id}
                className="card p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" style={{ color: '#1A1A1A' }}>{zone.name}</h4>
                  <span className="text-sm" style={{ color: '#4A4A4A' }}>
                    {zone.quantity} seats
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1" style={{ color: '#FF3399' }}>
                  {formatPrice(zone.price)}
                </div>
                <p className="text-sm mb-3" style={{ color: '#4A4A4A' }}>
                  {zone.description || 'No description provided.'}
                </p>
                {zone.benefits && (
                  <p className="text-xs" style={{ color: '#4A4A4A' }}>
                    <span className="font-semibold">Benefits:</span> {zone.benefits}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      {event.status === 'PUBLISHED' && user?.userType !== 'ADMIN' && (
        <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--blue-50) 100%)' }}>
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Ready to attend?</h3>
          <p className="mb-6" style={{ color: '#4A4A4A' }}>
            Join this amazing event and live an unforgettable experience
          </p>
          <Link
            to={`/events/${event.id}/tickets`}
            className="btn-primary inline-flex items-center space-x-3 px-8 py-4 text-lg font-semibold"
          >
            <ShoppingCart className="w-6 h-6" />
            <span>Buy tickets now</span>
          </Link>
        </div>
      )}
    </div>
  );
};
