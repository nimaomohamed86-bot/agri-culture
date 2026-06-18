import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Truck } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { productApi, orderApi } from '../../api/services';

export default function SupplierDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0 });

  useEffect(() => {
    Promise.all([productApi.getAll({ limit: 1 }), orderApi.getAll({ limit: 100 })])
      .then(([prodRes, orderRes]) => {
        const orders = orderRes.data.data;
        setStats({
          products: prodRes.data.meta?.total || 0,
          orders: orders.length,
          pending: orders.filter((o) => o.status === 'PENDING').length,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
        <p className="text-gray-500">Manage your products and fulfill orders</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="My Products" value={stats.products} icon={Package} />
        <StatCard title="Total Orders" value={stats.orders} icon={ShoppingCart} color="blue" />
        <StatCard title="Pending Orders" value={stats.pending} icon={Truck} color="orange" />
      </div>
    </div>
  );
}
