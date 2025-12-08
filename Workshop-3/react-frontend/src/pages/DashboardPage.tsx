import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Ticket,
  Activity,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Error loading dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" style={{ width: '48px', height: '48px', borderWidth: '4px', borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card p-6 max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-600">Error</h3>
          </div>
          <p className="text-gray-700 mb-4">{error || 'Unknown error'}</p>
          <button
            onClick={loadDashboardData}
            className="btn-primary w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const revenueByEventData = {
    labels: stats.revenueByEvent.map(e => e.eventName),
    datasets: [
      {
        label: 'Revenue',
        data: stats.revenueByEvent.map(e => e.revenue),
        backgroundColor: 'rgba(147, 51, 234, 0.6)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const salesOverTimeData = {
    labels: stats.salesOverTime.map(s => new Date(s.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue',
        data: stats.salesOverTime.map(s => s.revenue),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const ticketDistributionData = {
    labels: stats.ticketTypeDistribution.map(t => t.ticketType),
    datasets: [
      {
        data: stats.ticketTypeDistribution.map(t => t.quantity),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(147, 51, 234, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(251, 146, 60, 0.6)',
          'rgba(34, 197, 94, 0.6)',
        ],
      },
    ],
  };

  const orderStatusData = {
    labels: stats.orderStatusDistribution.map(o => o.status),
    datasets: [
      {
        data: stats.orderStatusDistribution.map(o => o.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(251, 146, 60, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of statistics and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)' }}>
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Total Revenue</p>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Total Events</p>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{formatNumber(stats.totalEvents)}</p>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Ticket className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Tickets Sold</p>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {formatNumber(stats.totalTicketsSold)}
          </p>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Active Events</p>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{formatNumber(stats.activeEvents)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Event (Top 10)
          </h3>
          <div style={{ height: '300px' }}>
            <Bar data={revenueByEventData} options={chartOptions} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
            Sales Over Time (Current Month)
          </h3>
          <div style={{ height: '300px' }}>
            <Line data={salesOverTimeData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
            Ticket Type Distribution
          </h3>
          <div style={{ height: '300px' }}>
            <Pie
              data={ticketDistributionData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value} tickets`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
            Order Status Distribution
          </h3>
          <div style={{ height: '300px' }}>
            <Doughnut
              data={orderStatusData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value} orders`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
          Recent Events
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {event.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.status === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-600'
                          : event.status === 'PUBLISHED'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatNumber(event.ticketsSold)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatCurrency(event.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
