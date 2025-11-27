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
import { useAuthStore } from '../store/authStore';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setEvent(eventData);
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
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
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
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Link>
              
              <button
                onClick={handleDeleteEvent}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Event header */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {event.category?.name}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-800' 
                  : event.status === 'DRAFT'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {event.status === 'PUBLISHED' ? 'Published' : 
                 event.status === 'DRAFT' ? 'Draft' : 'Canceled'}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPrice(event.ticketPrice)}
            </div>
            <div className="text-sm text-gray-600">per person</div>
          </div>
        </div>

        {/* Key event information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Start date</div>
              <div className="text-sm text-gray-600">{formatDate(event.startDate)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">End date</div>
              <div className="text-sm text-gray-600">{formatDate(event.endDate)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">{event.location?.name}</div>
              <div className="text-sm text-gray-600">{event.location?.address}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Capacity</div>
              <div className="text-sm text-gray-600">{event.maxAttendees} people</div>
            </div>
          </div>
        </div>

        {/* Main purchase button */}
        {event.status === 'PUBLISHED' && user?.userType === 'BUYER' && (
          <div className="text-center">
            <Link
              to={`/events/${event.id}/tickets`}
              className="inline-flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Buy tickets</span>
            </Link>
          </div>
        )}
      </div>

      {/* Event description */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About this event</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>
      </div>

      {/* Additional information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-blue-600" />
            Location
          </h3>
          <div className="space-y-2">
            <div className="font-medium text-gray-900">{event.location?.name}</div>
            <div className="text-gray-600">{event.location?.address}</div>
            <div className="text-sm text-gray-500">
              Capacity: {event.location?.capacity} attendees
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Organizer
          </h3>
          <div className="space-y-2">
            <div className="font-medium text-gray-900">Organizer #{event.organizerId}</div>
            <div className="text-gray-600">Contact information available after purchase</div>
          </div>
        </div>
      </div>

      {/* Ticket zones */}
      {event.ticketTypes && event.ticketTypes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-gray-900">Ticket zones</h3>
            <span className="text-sm text-gray-500">
              {event.ticketTypes.length} options
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.ticketTypes.map((zone) => (
              <div
                key={zone.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                  <span className="text-sm text-gray-600">
                    {zone.quantity} seats
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {formatPrice(zone.price)}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {zone.description || 'No description provided.'}
                </p>
                {zone.benefits && (
                  <p className="text-xs text-gray-500">
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
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to attend?</h3>
          <p className="text-gray-600 mb-6">
            Join this amazing event and live an unforgettable experience
          </p>
          <Link
            to={`/events/${event.id}/tickets`}
            className="inline-flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            <span>Buy tickets now</span>
          </Link>
        </div>
      )}
    </div>
  );
};
