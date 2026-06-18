import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { productApi } from '../../api/services';
import { formatCurrency, formatCategory } from '../../utils/helpers';

export default function ProductsPage({ farmerMode = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: 'FRUITS',
    description: '',
    price: '',
    quantity: '',
    unit: 'Kg',
    minimumStock: '10',
  });
  const [image, setImage] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({
        page,
        limit: 10,
        search,
        category: category || undefined,
      });
      setProducts(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    productApi.getCategories().then((res) => setCategories(res.data.data));
    fetchProducts();
  }, [page, search, category]);

  const resetForm = () => {
    setForm({
      name: '',
      category: 'FRUITS',
      description: '',
      price: '',
      quantity: '',
      unit: 'Kg',
      minimumStock: '10',
    });
    setImage(null);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);

    try {
      if (editing) {
        await productApi.update(editing.id, fd);
        toast.success('Product updated');
      } else {
        await productApi.create(fd);
        toast.success('Product created');
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      unit: product.unit,
      minimumStock: product.inventory?.minimumStock || 10,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productApi.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleQuantityUpdate = async (id) => {
    const qty = prompt('Enter quantity to add (stock in):');
    if (!qty) return;
    try {
      await productApi.updateQuantity(id, { quantity: parseInt(qty, 10), type: 'STOCK_IN' });
      toast.success('Quantity updated');
      fetchProducts();
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (r) =>
        r.image ? (
          <img src={r.image} alt={r.name} className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs dark:bg-gray-800">
            N/A
          </div>
        ),
    },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category', render: (r) => formatCategory(r.category) },
    { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    { key: 'quantity', label: 'Qty', render: (r) => `${r.quantity} ${r.unit}` },
    { key: 'stockStatus', label: 'Status', render: (r) => <StatusBadge status={r.stockStatus} /> },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (r) => r.supplier?.fullName || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(r)} className="text-primary-600">
            <Pencil className="h-4 w-4" />
          </button>
          {!farmerMode && (
            <>
              <button onClick={() => handleQuantityUpdate(r.id)} className="text-blue-600 text-xs">
                Stock+
              </button>
              <button onClick={() => handleDelete(r.id)} className="text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{farmerMode ? 'My Products' : 'Products'}</h1>
          <p className="text-gray-500">Manage agricultural product catalog</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        page={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
        actions={
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="input-field !w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{formatCategory(c)}</option>
            ))}
          </select>
        }
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <input
                required
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{formatCategory(c)}</option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input-field"
                />
                {!editing && (
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="input-field"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="input-field"
                >
                  {['Kg', 'Ton', 'Sack', 'Bag', 'Litre', 'Piece'].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
