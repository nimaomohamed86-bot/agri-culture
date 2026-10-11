import { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import { userApi } from '../../api/services';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleEdit = (supplier) => {
    setEditingSupplier({
      id: supplier.id,
      fullName: supplier.fullName,
      email: supplier.email,
      phone: supplier.phone || '',
    });
  };

  const loadSuppliers = async () => {
    try {
      const res = await userApi.getSuppliers();
      setSuppliers(res.data.data);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  loadSuppliers();
}, []);

 const handleAdd = async () => {
  try {
    await userApi.create({
      ...formData,
      role: 'SUPPLIER',
    });

    toast.success('Supplier added');

    setShowModal(false);

    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
    });

    loadSuppliers();
  } catch {
    toast.error('Failed to add supplier');
  }
};

  const handleUpdate = async () => {
  try {
    await userApi.update(editingSupplier.id, {
      fullName: editingSupplier.fullName,
      phone: editingSupplier.phone,
      role: 'SUPPLIER',
    });

    toast.success('Supplier updated');

    setEditingSupplier(null);
    loadSuppliers();
  } catch {
    toast.error('Failed to update supplier');
  }
};

  const handleDelete = async (supplier) => {
  if (!window.confirm(`Delete ${supplier.fullName}?`)) {
    return;
  }

  try {
    await userApi.delete(supplier.id);

    toast.success('Supplier deleted');
    loadSuppliers();
  } catch {
    toast.error('Failed to delete supplier');
  }
};

  const columns = [
    {
      key: 'fullName',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (r) => r.phone || '-',
    },
    {
      key: 'products',
      label: 'Products',
      render: (r) => r._count?.productsAsSupplier || 0,
    },
    {
  key: 'actions',
  label: 'Actions',
  render: (row) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleEdit(row)}
        className="px-3 py-1 bg-blue-600 text-white rounded"
        
      >
        Edit
      </button>

      <button
        onClick={() => handleDelete(row)}
        className="px-3 py-1 bg-red-600 text-white rounded"
        
      >
        Delete
      </button>
    </div>
  ),
}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Suppliers
          </h1>
          <p className="text-gray-500">
            Manage suppliers
          </p>
        </div>

        <button
  onClick={() => setShowModal(true)}
  className="px-4 py-2 bg-green-600 text-white rounded"
>
  Add Supplier
</button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
      />
    {showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-white">
        Add Supplier
      </h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({
              ...formData,
              fullName: e.target.value,
            })
          }
          className="w-full p-2 rounded border"
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          className="w-full p-2 rounded border"
        />

        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value,
            })
          }
          className="w-full p-2 rounded border"
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
          className="w-full p-2 rounded border"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Cancel
        </button>

      <button
  onClick={handleAdd}
  className="px-4 py-2 bg-green-600 text-white rounded"
>
  Save
</button>
      </div>
    </div>
  </div>
)}

{editingSupplier && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-bold text-white mb-4">
        Edit Supplier
      </h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={editingSupplier.fullName}
          onChange={(e) =>
            setEditingSupplier({
              ...editingSupplier,
              fullName: e.target.value,
            })
          }
          className="w-full p-2 rounded border"
        />

        <input
          type="email"
          placeholder="Email"
          value={editingSupplier.email}
          disabled
          className="w-full p-2 rounded border bg-gray-700"
        />

        <input
          type="text"
          placeholder="Phone"
          value={editingSupplier.phone}
          onChange={(e) =>
            setEditingSupplier({
              ...editingSupplier,
              phone: e.target.value,
            })
          }
          className="w-full p-2 rounded border"
        />

        <input
          type="text"
          value={
            suppliers.find(
              (s) => s.id === editingSupplier.id
            )?._count?.productsAsSupplier || 0
          }
          disabled
          className="w-full p-2 rounded border bg-gray-700"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setEditingSupplier(null)}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}