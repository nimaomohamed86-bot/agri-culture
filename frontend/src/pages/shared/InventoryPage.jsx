import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { inventoryApi } from '../../api/services';
import { formatDate } from '../../utils/helpers';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stock');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, histRes] = await Promise.all([
        inventoryApi.getAll({ lowStock: lowStockOnly ? 'true' : undefined }),
        inventoryApi.getHistory({ limit: 20 }),
      ]);
      setInventory(invRes.data.data);
      setHistory(histRes.data.data);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lowStockOnly]);

  const handleStockAction = async (productId, type) => {
    const qty = prompt(`Enter quantity to ${type === 'in' ? 'add' : 'remove'}:`);
    if (!qty) return;
    const note = prompt('Note (optional):') || '';
    try {
      if (type === 'in') {
        await inventoryApi.stockIn(productId, { quantity: parseInt(qty, 10), note });
      } else {
        await inventoryApi.stockOut(productId, { quantity: parseInt(qty, 10), note });
      }
      toast.success('Stock updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    }
  };

  const stockColumns = [
    { key: 'product', label: 'Product', render: (r) => r.product?.name },
    { key: 'currentStock', label: 'Current Stock', render: (r) => `${r.currentStock} ${r.product?.unit}` },
    { key: 'minimumStock', label: 'Min Stock', render: (r) => r.minimumStock },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.product?.stockStatus} />,
    },
    { key: 'supplier', label: 'Supplier', render: (r) => r.product?.supplier?.fullName || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleStockAction(r.productId, 'in')}
            className="text-xs text-green-600 hover:underline"
          >
            Stock In
          </button>
          <button
            onClick={() => handleStockAction(r.productId, 'out')}
            className="text-xs text-red-600 hover:underline"
          >
            Stock Out
          </button>
        </div>
      ),
    },
  ];

  const historyColumns = [
    { key: 'product', label: 'Product', render: (r) => r.product?.name },
    { key: 'type', label: 'Type', render: (r) => r.type.replace('_', ' ') },
    { key: 'quantity', label: 'Quantity', render: (r) => `${r.quantity} ${r.product?.unit}` },
    { key: 'note', label: 'Note', render: (r) => r.note || '-' },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-500">Track stock levels and movement history</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('stock')}
            className={tab === 'stock' ? 'btn-primary' : 'btn-secondary'}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setTab('history')}
            className={tab === 'history' ? 'btn-primary' : 'btn-secondary'}
          >
            Movement History
          </button>
        </div>
      </div>

      {tab === 'stock' ? (
        <DataTable
          columns={stockColumns}
          data={inventory}
          loading={loading}
          actions={
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              Low stock only
            </label>
          }
        />
      ) : (
        <DataTable columns={historyColumns} data={history} loading={loading} />
      )}
    </div>
  );
}
