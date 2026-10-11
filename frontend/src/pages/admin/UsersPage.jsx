import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import { userApi } from '../../api/services';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function UsersPage() {
  const { user } = useAuth();
const isAdmin = user?.role === 'ADMIN';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  const [showAddModal, setShowAddModal] = useState(false);
const [editingUser, setEditingUser] = useState(null);

const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'CUSTOMER',
});

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
  const handleAddUser = async (e) => {
  e.preventDefault();

  try {
    await userApi.create(formData);

    toast.success('User created');
    setShowAddModal(false);

    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'CUSTOMER',
    });

    fetchUsers();
  } catch (err) {
    console.log('ERROR FULL:', err);
    console.log('STATUS:', err.response?.status);
    console.log('DATA:', err.response?.data);

    toast.error(
      err.response?.data?.message ||
      JSON.stringify(err.response?.data) ||
      'Failed to create user'
    );
  }
};

const handleEditUser = async (e) => {
  e.preventDefault();

  try {
    await userApi.update(editingUser.id, formData);

    toast.success('User updated');
    setEditingUser(null);

    fetchUsers();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update user');
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
  render: (r) =>
    isAdmin ? (
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
    ) : (
      <span>{r.role}</span>
    ),
},
    { key: 'createdAt', label: 'Joined', render: (r) => formatDate(r.createdAt) },
    {
 
  key: 'actions',
  label: 'Actions',
  render: (r) =>
    isAdmin ? (
      <div className="flex gap-3">
        <button
          onClick={() => {
            setEditingUser(r);

            setFormData({
              fullName: r.fullName || '',
              email: r.email || '',
              phone: r.phone || '',
              password: '',
              role: r.role,
            });
          }}
          className="text-blue-600 hover:underline"
        >
          Edit
        </button>

        <button
          onClick={() => handleDelete(r.id)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    ) : null,
  }

  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-500">Manage system users and roles</p>
      </div>

      {isAdmin && (
  <button
    onClick={() => {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'CUSTOMER',
      });

      setShowAddModal(true);
    }}
    className="px-4 py-2 bg-green-600 text-white rounded-lg"
  >
    Add User
  </button>
)}





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
    isAdmin && (
      <select
        value={roleFilter}
        onChange={(e) => {
          setRoleFilter(e.target.value);
          setPage(1);
        }}
        className="input-field !w-auto"
      >
        <option value="">All Roles</option>
        {['ADMIN', 'SUPPLIER', 'FARMER', 'CUSTOMER'].map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    )
  }
/>

{(showAddModal || editingUser) && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <form
      onSubmit={editingUser ? handleEditUser : handleAddUser}
      className="bg-white p-6 rounded-lg w-full max-w-md space-y-4"
    >
      <h2 className="text-xl font-bold">
        {editingUser ? 'Edit User' : 'Add User'}
      </h2>

      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) =>
          setFormData({ ...formData, fullName: e.target.value })
        }
        className="input-field"
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
        className="input-field"
      />

      <input
        type="text"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) =>
          setFormData({ ...formData, phone: e.target.value })
        }
        className="input-field"
      />

      {!editingUser && (
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="input-field"
        />
      )}

      <select
        value={formData.role}
        onChange={(e) =>
          setFormData({ ...formData, role: e.target.value })
        }
        className="input-field"
      >
        <option value="ADMIN">ADMIN</option>
        <option value="SUPPLIER">SUPPLIER</option>
        <option value="FARMER">FARMER</option>
        <option value="CUSTOMER">CUSTOMER</option>
      </select>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setEditingUser(null);
          }}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded"
        >
          {editingUser ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  </div>
)}
    </div>
  );
}     