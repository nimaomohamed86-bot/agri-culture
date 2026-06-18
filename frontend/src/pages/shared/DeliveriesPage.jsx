import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { deliveryApi } from '../../api/services';
import { formatDate } from '../../utils/helpers';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await deliveryApi.getAll({ status: statusFilter || undefined });
      setDeliveries(res.data.data);
    } catch {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const handleUpdate = async (id, data) => {
    try {
      await deliveryApi.update(id, data);
      toast.success('Delivery updated');
      fetchDeliveries();
    } catch {
      toast.error('Failed to update delivery');
    }
  };

  const handleAssignDriver = async (orderId) => {
    const driverName = prompt('Driver name:');
    if (!driverName) return;
    const estimatedDate = prompt('Estimated date (YYYY-MM-DD):');
    try {
      await deliveryApi.assignDriver(orderId, {
        driverName,
        estimatedDate: estimatedDate || undefined,
      });
      toast.success('Driver assigned');
      fetchDeliveries();
    } catch {
      toast.error('Failed to assign driver');
    }
  };

  const columns = [
    {
      key: 'order',
      label: 'Order',
      render: (r) => `#${r.orderId?.slice(-8)}`,
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (r) => r.order?.customer?.fullName,
    },
    { key: 'driverName', label: 'Driver', render: (r) => r.driverName || 'Unassigned' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'estimatedDate',
      label: 'ETA',
      render: (r) => (r.estimatedDate ? formatDate(r.estimatedDate) : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {!r.driverName && (
            <button
              onClick={() => handleAssignDriver(r.orderId)}
              className="text-xs text-primary-600 hover:underline"
            >
              Assign Driver
            </button>
          )}
          <select
            value={r.status}
            onChange={(e) => handleUpdate(r.id, { status: e.target.value })}
            className="input-field !py-1 !text-xs !w-28"
          >
            {['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery Management</h1>
        <p className="text-gray-500">Track and manage order deliveries</p>
      </div>

      <DataTable
        columns={columns}
        data={deliveries}
        loading={loading}
        actions={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field !w-auto"
          >
            <option value="">All Status</option>
            {['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      />
    </div>
  );
}
