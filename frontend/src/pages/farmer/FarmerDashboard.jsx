import { useEffect, useState } from 'react';
import { Package, DollarSign, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import { reportApi, productApi } from '../../api/services';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function FarmerDashboard() {
  const [earnings, setEarnings] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [farmerStats, setFarmerStats] = useState(null);

  useEffect(() => {
    reportApi.getFarmerEarnings().then((res) => setEarnings(res.data.data));
    productApi.getAll({ limit: 1 }).then((res) => setProductCount(res.data.meta?.total || 0));
  }, []);

  const salesByProduct = {};
  earnings?.sales?.forEach((s) => {
    salesByProduct[s.productName] = (salesByProduct[s.productName] || 0) + s.revenue;
  });
  const chartData = Object.entries(salesByProduct).map(([name, revenue]) => ({ name, revenue }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
        <p className="text-gray-500">Track your products and earnings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="My Products" value={productCount} icon={Package} />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(earnings?.totalEarnings)}
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Total Sales"
          value={earnings?.sales?.length || 0}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 className="mb-4 font-semibold">Earnings by Product</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <DataTable
        columns={[
          { key: 'productName', label: 'Product' },
          { key: 'quantity', label: 'Qty Sold' },
          { key: 'revenue', label: 'Revenue', render: (r) => formatCurrency(r.revenue) },
          { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
        ]}
        data={earnings?.sales || []}
        emptyMessage="No sales yet"
      />
    </div>
  );
}
