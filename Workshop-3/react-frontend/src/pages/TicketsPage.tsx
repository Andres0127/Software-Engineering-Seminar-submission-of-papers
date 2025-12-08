import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Ticket, Calendar, MapPin, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { BuyerTicket } from '../types';
import { TicketService } from '../services/ticketService';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<BuyerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [qrImages, setQrImages] = useState<Record<number, string>>({});

  useEffect(() => {
    loadUserTickets();
  }, []);

  const loadUserTickets = async () => {
    try {
      setLoading(true);
      const data = await TicketService.getMyTickets();
      setTickets(data);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      toast.error(error.message || 'Unable to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    const now = new Date();
    return tickets.filter((ticket) => {
      const eventDate = new Date(ticket.eventStart);
      if (filter === 'upcoming') {
        return eventDate > now;
      }
      if (filter === 'past') {
        return eventDate < now;
      }
      return true;
    });
  }, [filter, tickets]);

  const downloadTicket = (ticket: BuyerTicket) => {
    const qrImage = qrImages[ticket.id];
    if (!qrImage) {
      toast.error('QR code is still generating. Please wait a moment.');
      return;
    }

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${ticket.orderNumber || 'ticket'}-${ticket.id}.png`;
    link.click();
    toast.success(`Downloading ticket for ${ticket.eventTitle}`);
  };

  useEffect(() => {
    const generateQrImages = async () => {
      const newImages: Record<number, string> = {};
      await Promise.all(
        tickets.map(async (ticket) => {
          if (!ticket.qrCode) return;
          try {
            newImages[ticket.id] = await QRCode.toDataURL(ticket.qrCode, {
              margin: 1,
              scale: 4,
            });
          } catch (error) {
            console.error('Failed to generate QR code', error);
          }
        })
      );
      if (Object.keys(newImages).length > 0) {
        setQrImages((prev) => ({ ...prev, ...newImages }));
      }
    };

    if (tickets.length > 0) {
      generateQrImages();
    }
  }, [tickets]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" style={{ width: '48px', height: '48px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Styled header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)',
        borderRadius: 'var(--border-radius-xl)',
        padding: '32px',
        color: 'var(--white)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-10 h-10" />
            <h1 className="text-4xl font-bold">My Tickets</h1>
          </div>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            Manage your tickets and access your events
          </p>
        </div>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '150px',
          height: '150px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}></div>
      </div>

      {/* Enhanced filters */}
      <div className="flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'filter-button-active' : 'filter-button'}
        >
          All ({tickets.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={filter === 'upcoming' ? 'filter-button-active' : 'filter-button'}
        >
          Upcoming ({tickets.filter((t) => new Date(t.eventStart) > new Date()).length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={filter === 'past' ? 'filter-button-active' : 'filter-button'}
        >
          Past ({tickets.filter((t) => new Date(t.eventStart) < new Date()).length})
        </button>
      </div>

      {/* Tickets list */}
      {filteredTickets.length === 0 ? (
        <div className="card text-center py-16">
          <div 
            className="rounded-full flex items-center justify-center mb-6"
            style={{ 
              width: '96px', 
              height: '96px', 
              backgroundColor: 'var(--gray-100)', 
              margin: '0 auto'
            }}
          >
            <Ticket className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">You have no tickets</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? "You haven't purchased any tickets yet."
              : filter === 'upcoming'
              ? 'You have no upcoming tickets.'
              : 'You have no past tickets.'}
          </p>
          <button className="btn-primary">
            Explore events
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      {ticket.eventTitle}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <div
                        className="p-2 rounded-lg mr-3"
                        style={{ backgroundColor: 'var(--primary-100)' }}
                      >
                        <Calendar className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                      </div>
                      <span className="font-medium">
                        {new Date(ticket.eventStart).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(ticket.eventStart).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <div
                        className="p-2 rounded-lg mr-3"
                        style={{ backgroundColor: '#d1fae520' }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: '#0077FF' }} />
                      </div>
                      <span className="font-medium">{ticket.locationName || 'Location pending'}</span>
                    </div>
                  </div>
                  {(() => {
                    const statusKey = ticket.status?.toLowerCase() || '';
                    const isConfirmed = statusKey === 'confirmed';
                    const isPending = statusKey === 'pending';
                    return (
                      <span
                        className={
                          isConfirmed
                            ? 'status-confirmed'
                            : isPending
                            ? 'status-pending'
                            : 'status-cancelled'
                        }
                      >
                        {isConfirmed ? 'Confirmed' : isPending ? 'Pending' : 'Cancelled'}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="card p-4">
                    <span className="label">Ticket type</span>
                    <p className="font-semibold text-gray-900">{ticket.ticketTypeName}</p>
                  </div>
                  <div className="card p-4">
                    <span className="label">Unit price</span>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'COP',
                      }).format(ticket.ticketPrice)}
                    </p>
                  </div>
                  <div className="card p-4">
                    <span className="label">Order</span>
                    <p className="font-semibold text-gray-900">{ticket.orderNumber}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm">
                      {qrImages[ticket.id] ? (
                        <img
                          alt="Ticket QR"
                          src={qrImages[ticket.id]}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center text-xs text-gray-500 h-full">
                          Generating QR
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">QR code</p>
                      <p className="text-xs text-gray-500">{ticket.qrCode?.slice(0, 20)}...</p>
                    </div>
                  </div>

                  {ticket.status?.toLowerCase() === 'confirmed' && (
                    <button
                      onClick={() => downloadTicket(ticket)}
                      className="btn-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
