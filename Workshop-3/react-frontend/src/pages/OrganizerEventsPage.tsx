import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BarChart3, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { Event, EventStatistics } from '../types';
import { EventService } from '../services/eventService';

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'COP' }).format(value);

export const OrganizerEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventStats, setEventStats] = useState<Record<number, EventStatistics>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const myEvents = await EventService.getMyEvents();
        setEvents(myEvents);
      } catch (error: any) {
        console.error('Error loading organizer events', error);
        toast.error('Unable to load your events.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length === 0) {
      setEventStats({});
      return;
    }

    let cancelled = false;

    const loadStats = async () => {
      setStatsLoading(true);
      const map: Record<number, EventStatistics> = {};

      await Promise.all(
        events.map(async (event) => {
          try {
            const stats = await EventService.getEventStatistics(event.id);
            map[event.id] = stats;
          } catch (error) {
            console.error('Error fetching event statistics', error);
          }
        })
      );

      if (!cancelled) {
        setEventStats(map);
        setStatsLoading(false);
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [events]);

  const refreshEvents = async () => {
    try {
      setLoading(true);
      const myEvents = await EventService.getMyEvents();
      setEvents(myEvents);
    } catch (error: any) {
      console.error('Error refreshing events', error);
      toast.error('Could not refresh the events.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    event: Event,
    targetStatus: 'PUBLISHED' | 'CANCELLED' | 'DRAFT'
  ) => {
    setActionLoading(event.id);
    try {
      await EventService.updateEvent(event.id, {
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        maxAttendees: event.maxAttendees,
        categoryId: event.categoryId || event.category?.id,
        locationId: event.locationId || event.location?.id,
        status: targetStatus,
        ticketPrice: event.ticketPrice,
        maxTicketsPerPurchase: event.maxTicketsPerPurchase ?? 10,
        ageRestriction: event.ageRestriction,
      });
      toast.success(`Event updated to ${targetStatus}`);
      refreshEvents();
    } catch (error: any) {
      console.error('Error updating event', error);
      toast.error(error.message || 'Unable to update the event status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    setActionLoading(eventId);
    try {
      await EventService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      refreshEvents();
    } catch (error: any) {
      console.error('Error deleting event', error);
      toast.error(error.message || 'Unable to delete the event');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = useMemo(() => {
    const published = events.filter((event) => event.status === 'PUBLISHED').length;
    const drafts = events.filter((event) => event.status === 'DRAFT').length;
    const capacity = events.reduce((sum, event) => sum + (event.maxAttendees || 0), 0);
    return [
      { title: 'Published events', value: published, Icon: Calendar },
      { title: 'Drafts', value: drafts, Icon: BarChart3 },
      { title: 'Total capacity', value: capacity, Icon: Users },
      { title: 'Total events', value: events.length, Icon: Ticket },
    ];
  }, [events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My events</h1>
          <p className="text-gray-600 mt-1">Manage, publish, and monitor the key metrics of your events.</p>
        </div>
        <Link to="/events/create" className="btn-primary">
          Create event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.Icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 mb-4">You currently have no events registered.</p>
            <Link to="/events/create" className="btn-success">
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => {
              const eventStat = eventStats[event.id];
              const targetStatus =
                event.status === 'PUBLISHED' ? 'CANCELLED' : 'PUBLISHED';
              const statusLabel =
                event.status === 'PUBLISHED' ? 'Cancel event' : 'Publish event';

              return (
                <div key={event.id} className="card p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.category?.name || 'Category pending'}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        event.status === 'PUBLISHED'
                          ? 'bg-success-100 text-success-600'
                          : event.status === 'DRAFT'
                          ? 'bg-warning-100 text-warning-600'
                          : 'bg-error-100 text-error-600'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed max-w-prose" style={{ minHeight: '64px' }}>
                    {event.description || 'No description yet.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      <span className="label">Start</span>
                      <p>{formatDate(event.startDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="label">Location</span>
                      <p>{event.location?.name || 'Location pending'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="label">Capacity</span>
                      <p>{event.maxAttendees} people</p>
                    </div>
                  </div>

                  {eventStat ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Tickets sold</p>
                        <p className="text-2xl font-semibold text-gray-900">{eventStat.ticketsSold}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Revenue</p>
                        <p className="text-2xl font-semibold text-success">
                          {formatCurrency(eventStat.totalRevenue)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Remaining capacity</p>
                        <p className="text-2xl font-semibold text-gray-900">{eventStat.remainingCapacity}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {statsLoading ? 'Loading statistics...' : 'Statistics not available yet.'}
                    </p>
                  )}

                  {eventStat?.ticketTypes?.length ? (
                    <div className="border border-dashed border-gray-200 rounded-lg p-4">
                      <p className="text-xs uppercase text-gray-500 mb-2">Lead ticket type</p>
                      <p className="font-semibold text-gray-900">{eventStat.ticketTypes[0].name}</p>
                      <p className="text-sm text-gray-600">
                        Sold: {eventStat.ticketTypes[0].sold} / {eventStat.ticketTypes[0].quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Revenue: {formatCurrency(eventStat.ticketTypes[0].revenue)}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <Link to={`/events/${event.id}`} className="btn-outline">
                      View details
                    </Link>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(event.ticketPrice)} COP
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleStatusChange(event, targetStatus)}
                      disabled={actionLoading === event.id}
                      className="btn-primary flex-1"
                    >
                      {actionLoading === event.id ? 'Processing...' : statusLabel}
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={actionLoading === event.id}
                      className="btn-error flex-1"
                    >
                      {actionLoading === event.id ? 'Deleting...' : 'Delete event'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

