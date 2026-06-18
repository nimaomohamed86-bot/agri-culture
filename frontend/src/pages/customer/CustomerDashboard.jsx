import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Truck, ArrowRight } from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { orderApi } from '../../api/services';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderApi.getAll({ limit: 5 }).then((res) => setOrders(res.data.data));
  }, []);

  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
  const activeOrders = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-gray-500">Browse fresh agricultural products</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Orders" value={orders.length} icon={ShoppingBag} />
        <StatCard title="Active Orders" value={activeOrders} icon={Truck} color="blue" />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} icon={Package} color="primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/customer/products" className="card group flex items-center justify-between transition hover:border-primary-300">
          <div>
            <h3 className="font-semibold">Browse Products</h3>
            <p className="text-sm text-gray-500">Explore fresh produce</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:text-primary-600" />
        </Link>
        <Link to="/customer/cart" className="card group flex items-center justify-between transition hover:border-primary-300">
          <div>
            <h3 className="font-semibold">View Cart</h3>
            <p className="text-sm text-gray-500">Checkout your items</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:text-primary-600" />
        </Link>
      </div>

      {orders.length > 0 && (
        <div className="card">
          <h3 className="mb-4 font-semibold">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <div>
                  <p className="font-mono text-xs">#{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="mt-1 text-sm font-medium">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
