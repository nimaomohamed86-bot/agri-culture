import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import { reportApi } from '../../api/services';
import { formatCurrency, downloadBlob } from '../../utils/helpers';

export default function ReportsPage() {
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tab, setTab] = useState('sales');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      reportApi.getSales(),
      reportApi.getInventory(),
      reportApi.getSuppliers(),
      reportApi.getCustomers(),
    ])
      .then(([salesRes, invRes, supRes, custRes]) => {
        setSales(salesRes.data.data);
        setInventory(invRes.data.data);
        setSuppliers(supRes.data.data);
        setCustomers(custRes.data.data);
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const handleExportExcel = async () => {
    try {
      const res = await reportApi.exportSalesExcel();
      downloadBlob(res.data, 'sales-report.xlsx');
      toast.success('Excel exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await reportApi.exportSalesPDF();
      downloadBlob(res.data, 'sales-report.pdf');
      toast.success('PDF exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const supplierChartData = suppliers.map((s) => ({
    name: s.fullName?.split(' ')[0],
    sales: s.totalSales,
    products: s.productCount,
  }));

  const tabs = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'inventory', label: 'Inventory Report' },
    { id: 'suppliers', label: 'Supplier Performance' },
    { id: 'customers', label: 'Customer Purchases' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500">Business intelligence and export tools</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="btn-secondary">
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </button>
          <button onClick={handleExportPDF} className="btn-secondary">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'btn-primary' : 'btn-secondary'}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{sales?.summary?.totalOrders}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(sales?.summary?.totalRevenue)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold">
                {formatCurrency(sales?.summary?.averageOrderValue)}
              </p>
            </div>
          </div>
          <DataTable
            columns={[
              { key: 'id', label: 'Order', render: (r) => `#${r.id.slice(-8)}` },
              { key: 'customer', label: 'Customer', render: (r) => r.customer?.fullName },
              { key: 'totalAmount', label: 'Amount', render: (r) => formatCurrency(r.totalAmount) },
              { key: 'status', label: 'Status' },
            ]}
            data={sales?.orders?.slice(0, 20) || []}
          />
        </div>
      )}

      {tab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="card"><p className="text-sm text-gray-500">Total Products</p><p className="text-2xl font-bold">{inventory?.summary?.totalProducts}</p></div>
            <div className="card"><p className="text-sm text-gray-500">In Stock</p><p className="text-2xl font-bold text-green-600">{inventory?.summary?.inStock}</p></div>
            <div className="card"><p className="text-sm text-gray-500">Low Stock</p><p className="text-2xl font-bold text-orange-600">{inventory?.summary?.lowStock}</p></div>
            <div className="card"><p className="text-sm text-gray-500">Total Value</p><p className="text-2xl font-bold">{formatCurrency(inventory?.summary?.totalValue)}</p></div>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Product' },
              { key: 'category', label: 'Category' },
              { key: 'quantity', label: 'Qty' },
              { key: 'stockStatus', label: 'Status' },
              { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
            ]}
            data={inventory?.products || []}
          />
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="mb-4 font-semibold">Supplier Sales Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <DataTable
            columns={[
              { key: 'fullName', label: 'Supplier' },
              { key: 'email', label: 'Email' },
              { key: 'productCount', label: 'Products' },
              { key: 'totalSales', label: 'Total Sales', render: (r) => formatCurrency(r.totalSales) },
            ]}
            data={suppliers}
          />
        </div>
      )}

      {tab === 'customers' && (
        <DataTable
          columns={[
            { key: 'fullName', label: 'Customer' },
            { key: 'email', label: 'Email' },
            { key: 'orderCount', label: 'Orders' },
            { key: 'totalSpent', label: 'Total Spent', render: (r) => formatCurrency(r.totalSpent) },
          ]}
          data={customers}
        />
      )}
    </div>
  );
}
