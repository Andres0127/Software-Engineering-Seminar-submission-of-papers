import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Receipt, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Order } from '../types';
import { TicketService } from '../services/ticketService';
import { useAuthStore } from '../store/authStore';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-red-100 text-red-800',
  REFUND_REQUESTED: 'bg-yellow-100 text-yellow-800',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrders, setProcessingOrders] = useState<Record<number, boolean>>({});

  const loadOrders = async () => {
    if (!isAuthenticated) {
      toast.error('You must log in to view your orders');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const data = await TicketService.getMyOrders();
      setOrders(data);
    } catch (error: any) {
      console.error('Error loading orders', error);
      toast.error(error.response?.data?.detail || 'Unable to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated, navigate]);

  const formatStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    return status
      .toLowerCase()
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  };

  const setOrderProcessing = (orderId: number, value: boolean) => {
    setProcessingOrders((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const handleCancel = async (orderId: number) => {
    setOrderProcessing(orderId, true);
    try {
      await TicketService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      await loadOrders();
    } catch (error: any) {
      console.error('Error cancelling order', error);
      toast.error(error.response?.data?.detail || 'Unable to cancel order');
    } finally {
      setOrderProcessing(orderId, false);
    }
  };

  const handleRefund = async (orderId: number) => {
    const reason = window.prompt('Please enter the reason for the refund request:');
    if (!reason?.trim()) {
      toast.error('Refund reason is required to continue');
      return;
    }

    setOrderProcessing(orderId, true);
    try {
      await TicketService.requestRefund(orderId, reason.trim());
      toast.success('Refund request submitted successfully');
      await loadOrders();
    } catch (error: any) {
      console.error('Error requesting refund', error);
      toast.error(error.response?.data?.detail || 'Unable to request a refund');
    } finally {
      setOrderProcessing(orderId, false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Check the status of your purchases and access the summary.</p>
        </div>
        <button
          onClick={loadOrders}
          className="btn-outline inline-flex items-center gap-2"
          disabled={loading}
        >
          <ArrowRight className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mb-6">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">You have no orders yet</h3>
          <p className="text-gray-600 mb-4">Explore events and add tickets to your cart.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const orderStatus = (order.status || '').toUpperCase();
            const isProcessing = Boolean(processingOrders[order.id]);
            const showCancel = orderStatus === 'PENDING';
            const showRefund = orderStatus === 'CONFIRMED';

            return (
              <div key={order.id} className="card p-6 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Order #{order.orderNumber}
                    </p>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {formatCurrency(Number(order.totalAmount))}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusStyles[orderStatus] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {formatStatusLabel(orderStatus)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm text-gray-600">
                  <div>
                    <span className="label">Date</span>
                    <p>{new Date(order.purchaseDate).toLocaleString('es-CO')}</p>
                  </div>
                  <div>
                    <span className="label">Event</span>
                    <p>{order.eventId ? `ID ${order.eventId}` : 'Event not available'}</p>
                  </div>
                  <div>
                    <span className="label">Tickets</span>
                    <p>{order.quantity ?? 0}</p>
                  </div>
                </div>

                {order.refundReason && orderStatus === 'REFUND_REQUESTED' && (
                  <p className="text-sm text-gray-600 mt-4">
                    <span className="font-semibold">Refund reason:</span> {order.refundReason}
                  </p>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Actions</p>
                    <div className="flex gap-3 flex-wrap">
                      {showCancel && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="btn-outline"
                          disabled={isProcessing}
                        >
                          Cancel order
                        </button>
                      )}
                      {showRefund && (
                        <button
                          onClick={() => handleRefund(order.id)}
                          className="btn-primary"
                          disabled={isProcessing}
                        >
                          Request refund
                        </button>
                      )}
                    </div>
                  </div>
                  {isProcessing && (
                    <p className="text-xs italic text-gray-500">Processing...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


