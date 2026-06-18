import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { orderApi } from '../../api/services';
import { formatCurrency, formatDate, downloadBlob } from '../../utils/helpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrdersPage({ adminMode = false, supplierMode = false }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      let data = res.data.data;
      if (search) {
        data = data.filter(
          (o) =>
            o.id.includes(search) ||
            o.customer?.fullName?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setOrders(data);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await orderApi.updateStatus(id, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await orderApi.cancel(id);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const downloadInvoice = async (order) => {
    try {
      const res = await orderApi.getInvoice(order.id);
      const inv = res.data.data;

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('INVOICE', 14, 22);
      doc.setFontSize(10);
      doc.text(`Invoice #: ${inv.invoiceNumber}`, 14, 32);
      doc.text(`Date: ${formatDate(inv.date)}`, 14, 38);
      doc.text(`Customer: ${inv.customer.fullName}`, 14, 44);
      doc.text(`Email: ${inv.customer.email}`, 14, 50);

      autoTable(doc, {
        startY: 58,
        head: [['Product', 'Qty', 'Unit', 'Price', 'Total']],
        body: inv.items.map((i) => [
          i.name,
          i.quantity,
          i.unit,
          formatCurrency(i.price),
          formatCurrency(i.total),
        ]),
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text(`Total: ${formatCurrency(inv.total)}`, 14, finalY);
      doc.text(`Status: ${inv.status}`, 14, finalY + 6);
      doc.text(`Payment: ${inv.paymentStatus}`, 14, finalY + 12);

      doc.save(`invoice-${inv.invoiceNumber}.pdf`);
    } catch {
      toast.error('Failed to generate invoice');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (r) => (
        <button
          onClick={() => setSelected(selected?.id === r.id ? null : r)}
          className="font-mono text-xs text-primary-600 hover:underline"
        >
          #{r.id.slice(-8)}
        </button>
      ),
    },
    { key: 'customer', label: 'Customer', render: (r) => r.customer?.fullName },
    { key: 'totalAmount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (r) => <StatusBadge status={r.paymentStatus} />,
    },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {(adminMode || supplierMode) && r.status !== 'CANCELLED' && r.status !== 'DELIVERED' && (
            <select
              value={r.status}
              onChange={(e) => handleStatusUpdate(r.id, e.target.value)}
              className="input-field !py-1 !text-xs !w-28"
            >
              {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => downloadInvoice(r)}
            className="text-xs text-primary-600 hover:underline"
          >
            Invoice
          </button>
          {!adminMode && !supplierMode && !['DELIVERED', 'CANCELLED'].includes(r.status) && (
            <button onClick={() => handleCancel(r.id)} className="text-xs text-red-600 hover:underline">
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {adminMode ? 'All Orders' : supplierMode ? 'Supplier Orders' : 'My Orders'}
        </h1>
        <p className="text-gray-500">Track and manage orders</p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
        actions={
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field !w-auto"
          >
            <option value="">All Status</option>
            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      />

      {selected && (
        <div className="card">
          <h3 className="font-semibold">Order Details #{selected.id.slice(-8)}</h3>
          <div className="mt-4 space-y-2">
            {selected.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.product?.name} x {item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          {selected.delivery && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
              <p>Delivery: <StatusBadge status={selected.delivery.status} /></p>
              {selected.delivery.driverName && <p>Driver: {selected.delivery.driverName}</p>}
              {selected.delivery.estimatedDate && (
                <p>ETA: {formatDate(selected.delivery.estimatedDate)}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
