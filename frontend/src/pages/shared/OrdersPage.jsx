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

const openAddModal = () => {
  setFormData(emptyForm);
  setShowAddModal(true);
};
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

  const [showAddModal, setShowAddModal] = useState(false);
const [editingOrder, setEditingOrder] = useState(null);

const emptyForm = {
  customerName: '',
  totalAmount: '',
  status: 'PENDING',
  paymentStatus: 'PENDING',
};


const handleEdit = (order) => {
  setEditingOrder(order);
};

const handleUpdate = async () => {
  try {
    await orderApi.update(editingOrder.id, {
      totalAmount: Number(editingOrder.totalAmount),
      status: editingOrder.status,
      paymentStatus: editingOrder.paymentStatus,
    });

    toast.success('Order updated');

    setEditingOrder(null);
    fetchOrders();
  } catch (err) {
    toast.error('Failed to update order');
  }
};
const [formData, setFormData] = useState({
  customerId: '',
  totalAmount: '',
  status: 'PENDING',
  paymentStatus: 'PENDING',
});

const handleAdd = async () => {
  try {
    await orderApi.create({
      customerName: formData.customerName,
      totalAmount: Number(formData.totalAmount),
      status: formData.status,
      paymentStatus: formData.paymentStatus,
    });

    toast.success('Order added');

    setShowAddModal(false);
    setFormData(emptyForm);

    fetchOrders();
  } catch (err) {
    toast.error('Failed to add order');
  }
};

const handleDelete = async (order) => {
  if (!window.confirm(`Delete Order #${order.id.slice(-8)}?`)) {
    return;
  }

  try {
    await orderApi.delete(order.id);

    toast.success('Order deleted');
    fetchOrders();
  } catch {
    toast.error('Failed to delete order');
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

  {
    key: 'customer',
    label: 'Customer',
    render: (r) => r.customer?.fullName,
  },

  {
    key: 'totalAmount',
    label: 'Total',
    render: (r) => formatCurrency(r.totalAmount),
  },

  {
    key: 'status',
    label: 'Status',
    render: (r) => <StatusBadge status={r.status} />,
  },

  {
    key: 'paymentStatus',
    label: 'Payment',
    render: (r) => <StatusBadge status={r.paymentStatus} />,
  },

  {
    key: 'createdAt',
    label: 'Date',
    render: (r) => formatDate(r.createdAt),
  },

  {
    key: 'actions',
    label: 'Actions',
    render: (r) => (
      <div className="flex gap-2">

        {adminMode && (
          <>
            <button
              onClick={() => handleEdit(r)}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(r)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </>
        )}

        <button
          onClick={() => downloadInvoice(r)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Invoice
        </button>

        {!adminMode &&
          !supplierMode &&
          !['DELIVERED', 'CANCELLED'].includes(r.status) && (
            <button
              onClick={() => handleCancel(r.id)}
              className="px-3 py-1 bg-orange-600 text-white rounded"
            >
              Cancel
            </button>
          )}
      </div>
    
  
  ),
},
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
  <div>
    <h1 className="text-2xl font-bold">
      {adminMode ? 'All Orders' : supplierMode ? 'Supplier Orders' : 'My Orders'}
    </h1>

    <p className="text-gray-500">
      Track and manage orders
    </p>
  </div>

  {adminMode && (
   <button
  onClick={openAddModal}
  className="px-4 py-2 bg-green-600 text-white rounded"
>
  Add Order
</button>
  )}
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

      {showAddModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md border border-gray-700">

      <h2 className="text-xl font-bold mb-4">
        Add Order
      </h2>

      {/* ORDER ID */}
      <input
        placeholder="Order ID (Auto Generated)"
        disabled
        className="w-full bg-gray-800 border border-gray-700 text-gray-400 p-2 mb-3 rounded"
      />

      {/* CUSTOMER */}
     <input
  placeholder="Customer Name"
  value={formData.customerName || ''}
  onChange={(e) =>
    setFormData({
      ...formData,
      customerName: e.target.value,
    })
  }
  className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-3 rounded"
/>

      {/* TOTAL */}
      <input
        type="number"
        placeholder="Total Amount"
        value={formData.totalAmount}
        onChange={(e) =>
          setFormData({
            ...formData,
            totalAmount: e.target.value,
          })
        }
        className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-3 rounded"
      />

      {/* STATUS */}
      <select
        value={formData.status}
        onChange={(e) =>
          setFormData({
            ...formData,
            status: e.target.value,
          })
        }
        className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-3 rounded"
      >
        <option value="PENDING">PENDING</option>
        <option value="PROCESSING">PROCESSING</option>
        <option value="SHIPPED">SHIPPED</option>
        <option value="DELIVERED">DELIVERED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>

      {/* PAYMENT */}
      <select
        value={formData.paymentStatus}
        onChange={(e) =>
          setFormData({
            ...formData,
            paymentStatus: e.target.value,
          })
        }
        className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-3 rounded"
      >
        <option value="PENDING">PENDING</option>
        <option value="PAID">PAID</option>
        <option value="FAILED">FAILED</option>
        <option value="REFUNDED">REFUNDED</option>
      </select>

      {/* DATE */}
      <input
        type="datetime-local"
        value={formData.createdAt || ''}
        onChange={(e) =>
          setFormData({
            ...formData,
            createdAt: e.target.value,
          })
        }
        className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-4 rounded"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Save
        </button>

        <button
          onClick={() => setShowAddModal(false)}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
{editingOrder && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-900 text-white p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl">

      <h2 className="text-2xl font-bold mb-4">
        Edit Order #{editingOrder.id.slice(-8)}
      </h2>

      {/* ORDER ID */}
      <div className="mb-4 text-sm text-gray-400">
        <span className="font-semibold">Order ID:</span> {editingOrder.id}
      </div>

      {/* CUSTOMER */}
      <label className="block text-sm text-gray-300 mb-1">
        Customer
      </label>
      <input
        value={editingOrder.customer?.fullName || ''}
        disabled
        className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-4 rounded opacity-80 cursor-not-allowed"
      />

      {/* TOTAL */}
      <label className="block text-sm text-gray-300 mb-1">
        Total Amount
      </label>
      <input
        type="number"
        value={editingOrder.totalAmount}
        onChange={(e) =>
          setEditingOrder({
            ...editingOrder,
            totalAmount: e.target.value,
          })
        }
        className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* STATUS */}
      <label className="block text-sm text-gray-300 mb-1">
        Order Status
      </label>
      <select
        value={editingOrder.status}
        onChange={(e) =>
          setEditingOrder({
            ...editingOrder,
            status: e.target.value,
          })
        }
        className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="PENDING">PENDING</option>
        <option value="PROCESSING">PROCESSING</option>
        <option value="SHIPPED">SHIPPED</option>
        <option value="DELIVERED">DELIVERED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>

      {/* PAYMENT */}
      <label className="block text-sm text-gray-300 mb-1">
        Payment Status
      </label>
      <select
        value={editingOrder.paymentStatus}
        onChange={(e) =>
          setEditingOrder({
            ...editingOrder,
            paymentStatus: e.target.value,
          })
        }
        className="w-full bg-gray-800 border border-gray-700 text-white p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="PENDING">PENDING</option>
        <option value="PAID">PAID</option>
        <option value="FAILED">FAILED</option>
        <option value="REFUNDED">REFUNDED</option>
      </select>

      {/* DATE */}
      <div className="mb-5 text-sm text-gray-400">
        <span className="font-semibold">Date:</span>{' '}
        {new Date(editingOrder.createdAt).toLocaleString()}
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          Save Changes
        </button>

        <button
          onClick={() => setEditingOrder(null)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
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