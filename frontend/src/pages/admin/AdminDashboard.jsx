import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Users, Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { reportApi } from '../../api/services';
import { formatCurrency, formatDate } from '../../utils/helpers';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi
      .getDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card py-16 text-center">
        <p className="text-gray-500">Unable to load dashboard data. Please refresh the page.</p>
      </div>
    );
  }

  const orderChartData =
    stats?.ordersByStatus?.map((o) => ({
      name: o.status.replace('_', ' '),
      value: o._count.id,
    })) || [];

  const revenueData = (stats?.revenueByMonth || []).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">System overview and analytics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Users" value={stats.totalUsers ?? 0} icon={Users} color="blue" />
        <StatCard title="Products" value={stats.totalProducts ?? 0} icon={Package} color="primary" />
        <StatCard title="Orders" value={stats.totalOrders ?? 0} icon={ShoppingCart} color="purple" />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue ?? 0)}
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts ?? 0}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={orderChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {orderChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 font-semibold">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left font-medium text-gray-500">Order</th>
                <th className="pb-3 text-left font-medium text-gray-500">Customer</th>
                <th className="pb-3 text-left font-medium text-gray-500">Amount</th>
                <th className="pb-3 text-left font-medium text-gray-500">Status</th>
                <th className="pb-3 text-left font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {stats.recentOrders?.length ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 font-mono text-xs">#{order.id.slice(-8)}</td>
                    <td className="py-3">{order.customer?.fullName}</td>
                    <td className="py-3">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
