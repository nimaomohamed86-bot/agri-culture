import { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';
import { userApi } from '../../api/services';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi
      .getSuppliers()
      .then((res) => setSuppliers(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '-' },
    { key: 'products', label: 'Products', render: (r) => r._count?.productsAsSupplier || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <p className="text-gray-500">View registered suppliers</p>
      </div>
      <DataTable columns={columns} data={suppliers} loading={loading} />
    </div>
  );
}
