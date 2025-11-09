import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Calendar, 
  MapPin, 
  Users,
  CreditCard 
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Event, TicketType } from '../types';
import { EventService } from '../services/eventService';
import { TicketService } from '../services/ticketService';

export const TicketPurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<{[key: number]: number}>({});
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        const [eventData, ticketTypesData] = await Promise.all([
          EventService.getEventById(parseInt(id)),
          TicketService.getTicketTypes(parseInt(id)).catch(() => [])
        ]);
        
        setEvent(eventData);
        setTicketTypes(ticketTypesData);
        
        // Si no hay tipos de tickets específicos, crear uno básico
        if (ticketTypesData.length === 0 && eventData) {
          setTicketTypes([{
            id: 1,
            name: 'Ticket General',
            price: eventData.ticketPrice,
            quantity: eventData.maxAttendees,
            description: 'Entrada general al evento',
            eventId: eventData.id
          }]);
        }
        
      } catch (error: any) {
        toast.error(error.message);
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    // Calcular total
    const total = Object.entries(selectedTickets).reduce((sum, [ticketTypeId, quantity]) => {
      const ticketType = ticketTypes.find(t => t.id === parseInt(ticketTypeId));
      return sum + (ticketType ? ticketType.price * quantity : 0);
    }, 0);
    setTotalAmount(total);
  }, [selectedTickets, ticketTypes]);

  const updateTicketQuantity = async (ticketTypeId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    // Si es mayor a 0, verificar disponibilidad
    if (newQuantity > 0) {
      try {
        const availability = await TicketService.checkTicketAvailability(
          parseInt(id!), 
          ticketTypeId, 
          newQuantity
        ).catch(() => ({ available: true, remainingTickets: 100 })); // Fallback si falla
        
        if (!availability.available) {
          toast.error(`Solo quedan ${availability.remainingTickets} tickets disponibles`);
          return;
        }
      } catch (error) {
        // Si falla la verificación, permitir por ahora
        console.warn('No se pudo verificar disponibilidad');
      }
    }
    
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: newQuantity
    }));
  };

  const getTotalSelectedTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

  const handleProceedToCheckout = () => {
    if (getTotalSelectedTickets() === 0) {
      toast.error('Selecciona al menos un ticket');
      return;
    }

    // Crear datos para el checkout
    const checkoutData = {
      eventId: parseInt(id!),
      selectedTickets,
      totalAmount,
      event
    };

    // Guardar en sessionStorage para pasar al checkout
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    navigate(`/events/${id}/checkout`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h1>
          <Link to="/events" className="text-blue-600 hover:text-blue-800">
            Volver a eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al evento</span>
        </Link>
      </div>

      {/* Información del evento */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location?.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{event.maxAttendees} personas máx.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selección de tickets */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Seleccionar Tickets</h2>
          <p className="text-gray-600 mt-1">Elige la cantidad de tickets que deseas comprar</p>
        </div>

        <div className="p-6 space-y-4">
          {ticketTypes.map((ticketType) => (
            <div key={ticketType.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{ticketType.name}</h3>
                  <p className="text-sm text-gray-600">{ticketType.description}</p>
                  {ticketType.benefits && (
                    <p className="text-sm text-blue-600 mt-1">{ticketType.benefits}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(ticketType.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticketType.quantity} disponibles
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateTicketQuantity(
                      ticketType.id, 
                      (selectedTickets[ticketType.id] || 0) - 1
                    )}
                    disabled={!selectedTickets[ticketType.id]}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">
                    {selectedTickets[ticketType.id] || 0}
                  </span>
                  
                  <button
                    onClick={() => updateTicketQuantity(
                      ticketType.id, 
                      (selectedTickets[ticketType.id] || 0) + 1
                    )}
                    disabled={selectedTickets[ticketType.id] >= ticketType.quantity}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {selectedTickets[ticketType.id] > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(ticketType.price * selectedTickets[ticketType.id])}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedTickets[ticketType.id]} × {formatPrice(ticketType.price)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen y checkout */}
      {getTotalSelectedTickets() > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resumen de compra</h3>
              <p className="text-gray-600">{getTotalSelectedTickets()} ticket(s) seleccionado(s)</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(totalAmount)}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-6 h-6" />
            <span>Proceder al Pago</span>
          </button>
        </div>
      )}

      {/* Información importante */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Información importante</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Los tickets son válidos únicamente para la fecha y hora del evento</li>
          <li>• Revisa bien tu selección antes de proceder al pago</li>
          <li>• Los reembolsos están sujetos a las políticas del evento</li>
          <li>• Recibirás un email de confirmación después del pago</li>
        </ul>
      </div>
    </div>
  );
};
