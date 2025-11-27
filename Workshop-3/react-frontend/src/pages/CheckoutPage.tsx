import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { TicketService } from '../services/ticketService';
import { Event, TicketType } from '../types';

interface CheckoutSession {
  eventId: number;
  event: Event;
  ticketTypes: TicketType[];
  selectedTickets: Record<number, number>;
  totalAmount: number;
}

interface SelectedItem {
  ticketType: TicketType;
  quantity: number;
  subtotal: number;
}

export const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<CheckoutSession | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('checkoutData');
    if (!stored) {
      toast.error('No purchase data saved.');
      navigate('/events');
      return;
    }

    try {
      const parsed: CheckoutSession = JSON.parse(stored);
      if (Number(id) !== parsed.eventId) {
      toast.error('Checkout data does not match the selected event.');
        navigate('/events');
        return;
      }
      setCheckoutData(parsed);
    } catch (error) {
      console.error('Error parsing checkout data', error);
      toast.error('Checkout data is corrupted.');
      navigate('/events');
    }
  }, [id, navigate]);

  const selectedItems: SelectedItem[] = useMemo(() => {
    if (!checkoutData) return [];
    return Object.entries(checkoutData.selectedTickets || {})
      .map(([ticketTypeId, quantity]) => {
        const ticketType = checkoutData.ticketTypes.find(
          (type) => type.id === Number(ticketTypeId)
        );
        if (!ticketType || quantity <= 0) {
          return null;
        }
        return {
          ticketType,
          quantity,
          subtotal: ticketType.price * quantity,
        };
      })
      .filter((item): item is SelectedItem => Boolean(item));
  }, [checkoutData]);

  const grandTotal = useMemo(() => {
    if (!checkoutData) return 0;
    return selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [checkoutData, selectedItems]);

  const handleConfirm = async () => {
    if (!checkoutData || selectedItems.length === 0) {
      toast.error('Select at least one ticket to continue.');
      return;
    }

    setProcessing(true);
    try {
      for (const item of selectedItems) {
        const order = await TicketService.createOrder({
          eventId: checkoutData.eventId,
          ticketTypeId: item.ticketType.id,
          quantity: item.quantity,
        });
        await TicketService.confirmPayment(order.id, { paymentMethod: 'CREDIT_CARD' });
      }
      toast.success('Purchase recorded successfully');
      sessionStorage.removeItem('checkoutData');
      navigate('/orders');
    } catch (error: any) {
      console.error('Error creating order', error);
      toast.error(error.response?.data?.detail || error.message || 'Unable to complete the purchase');
    } finally {
      setProcessing(false);
    }
  };

  if (!checkoutData) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Review your purchase before confirming.</p>
        </div>
        <button
          onClick={() => navigate(`/events/${id}`)}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-wide text-gray-500">Event</p>
            <span className="text-sm text-gray-500">{checkoutData.event.status}</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{checkoutData.event.title}</h2>
            <p className="text-gray-500">{checkoutData.event.description}</p>
          <div className="space-y-1 text-gray-600 text-sm">
            <p>
              <span className="font-semibold">Start:</span> {new Date(checkoutData.event.startDate).toLocaleString('es-CO')}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {checkoutData.event.location?.name || 'Location not set'}
            </p>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Ticket summary</h3>
            <div className="inline-flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span>{selectedItems.length} types</span>
            </div>
          </div>

          <div className="space-y-4">
            {selectedItems.map((item) => (
              <div key={item.ticketType.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{item.ticketType.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {item.ticketType.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                  </p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {item.subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <p className="text-lg font-semibold text-gray-900">Total</p>
            <p className="text-2xl font-bold text-green-600">
              {grandTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={processing}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {processing ? 'Processing purchase...' : 'Confirm purchase'}
          </button>
        </div>
      </div>
    </div>
  );
};


