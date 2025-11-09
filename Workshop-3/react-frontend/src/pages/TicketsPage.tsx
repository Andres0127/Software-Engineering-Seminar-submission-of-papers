import React, { useEffect, useState } from 'react';
import { Ticket, Calendar, MapPin, CreditCard, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Tipos para tickets
interface UserTicket {
  id: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  location: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  qrCode?: string;
}

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    loadUserTickets();
  }, []);

  const loadUserTickets = async () => {
    try {
      setLoading(true);
      
      // Simulamos datos de tickets del usuario
      const mockTickets: UserTicket[] = [
        {
          id: 1,
          eventId: 1,
          eventName: 'Conferencia de Tecnología 2024',
          eventDate: '2024-03-15T09:00:00Z',
          location: 'Centro de Convenciones Bogotá',
          ticketType: 'VIP',
          quantity: 2,
          totalPrice: 200000,
          orderDate: '2024-01-15T10:30:00Z',
          status: 'confirmed',
          qrCode: 'QR123456789'
        },
        {
          id: 2,
          eventId: 3,
          eventName: 'Festival de Música Rock',
          eventDate: '2024-04-20T19:00:00Z',
          location: 'Estadio El Campín',
          ticketType: 'General',
          quantity: 1,
          totalPrice: 150000,
          orderDate: '2024-02-10T14:20:00Z',
          status: 'confirmed',
          qrCode: 'QR987654321'
        }
      ];

      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTickets = () => {
    const now = new Date();
    
    return tickets.filter(ticket => {
      const eventDate = new Date(ticket.eventDate);
      
      switch (filter) {
        case 'upcoming':
          return eventDate > now;
        case 'past':
          return eventDate < now;
        default:
          return true;
      }
    });
  };

  const downloadTicket = (ticket: UserTicket) => {
    toast.success(`Descargando ticket para ${ticket.eventName}`);
    // Aquí iría la lógica para generar y descargar el PDF del ticket
  };

  const getStatusColor = (status: UserTicket['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = getFilteredTickets();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" style={{ width: '48px', height: '48px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header con estilo mejorado */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--success-600) 100%)',
        borderRadius: 'var(--border-radius-xl)',
        padding: '32px',
        color: 'var(--white)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Mis Tickets</h1>
          </div>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            Gestiona tus entradas y accede a tus eventos
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

      {/* Filtros mejorados */}
      <div className="flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'filter-button-active' : 'filter-button'}
        >
          Todos ({tickets.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={filter === 'upcoming' ? 'filter-button-active' : 'filter-button'}
        >
          Próximos ({tickets.filter(t => new Date(t.eventDate) > new Date()).length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={filter === 'past' ? 'filter-button-active' : 'filter-button'}
        >
          Pasados ({tickets.filter(t => new Date(t.eventDate) < new Date()).length})
        </button>
      </div>

      {/* Lista de tickets */}
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
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No tienes tickets</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Aún no has comprado ningún ticket.'
              : `No tienes tickets ${filter === 'upcoming' ? 'próximos' : 'pasados'}.`
            }
          </p>
          <button className="btn-primary">
            Explorar eventos
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
                      {ticket.eventName}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <div 
                        className="p-2 rounded-lg mr-3"
                        style={{ backgroundColor: 'var(--primary-100)' }}
                      >
                        <Calendar className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                      </div>
                      <span className="font-medium">
                        {new Date(ticket.eventDate).toLocaleDateString('es-CO', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} - {new Date(ticket.eventDate).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <div 
                        className="p-2 rounded-lg mr-3"
                        style={{ backgroundColor: '#d1fae520' }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: 'var(--success-600)' }} />
                      </div>
                      <span className="font-medium">{ticket.location}</span>
                    </div>
                  </div>
                  <span
                    className={
                      ticket.status === 'confirmed' ? 'status-confirmed' :
                      ticket.status === 'pending' ? 'status-pending' : 'status-cancelled'
                    }
                  >
                    {ticket.status === 'confirmed' ? 'Confirmado' : 
                     ticket.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="card p-4">
                    <span className="label">Tipo de ticket</span>
                    <p className="font-semibold text-gray-900">{ticket.ticketType}</p>
                  </div>
                  <div className="card p-4">
                    <span className="label">Cantidad</span>
                    <p className="font-semibold text-gray-900">{ticket.quantity}</p>
                  </div>
                  <div className="card p-4">
                    <span className="label">Total pagado</span>
                    <p className="font-semibold text-success">
                      ${ticket.totalPrice.toLocaleString('es-CO')} COP
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center text-gray-500">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Comprado el {new Date(ticket.orderDate).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  
                  {ticket.status === 'confirmed' && (
                    <button
                      onClick={() => downloadTicket(ticket)}
                      className="btn-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Ticket
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
