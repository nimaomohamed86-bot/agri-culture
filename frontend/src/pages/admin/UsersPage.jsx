import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import { userApi } from '../../api/services';
import { formatDate } from '../../utils/helpers';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll({ page, limit: 10, search, role: roleFilter || undefined });
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleRoleChange = async (id, role) => {
    try {
      await userApi.update(id, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await userApi.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '-' },
    {
      key: 'role',
      label: 'Role',
      render: (r) => (
        <select
          value={r.role}
          onChange={(e) => handleRoleChange(r.id, e.target.value)}
          className="input-field !py-1 !text-xs"
        >
          {['ADMIN', 'SUPPLIER', 'FARMER', 'CUSTOMER'].map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button onClick={() => handleDelete(r.id)} className="text-sm text-red-600 hover:underline">
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-500">Manage system users and roles</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        page={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
        actions={
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field !w-auto"
          >
            <option value="">All Roles</option>
            {['ADMIN', 'SUPPLIER', 'FARMER', 'CUSTOMER'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        }
      />
    </div>
  );
}
