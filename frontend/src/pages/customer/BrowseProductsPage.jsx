import { useEffect, useState } from 'react';
import { ShoppingCart, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import { productApi, orderApi } from '../../api/services';
import { formatCurrency, formatCategory } from '../../utils/helpers';

export default function BrowseProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productApi.getCategories().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi
      .getAll({ search, category: category || undefined, limit: 50 })
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  }, [search, category]);

  const handleAddToCart = async (productId) => {
    try {
      await orderApi.addToCart({ productId, quantity: 1 });
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Products</h1>
        <p className="text-gray-500">Fresh agricultural products from local suppliers</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{formatCategory(c)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="card overflow-hidden !p-0">
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <StatusBadge status={product.stockStatus} />
                </div>
                <p className="mt-1 text-xs text-gray-500">{formatCategory(product.category)}</p>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-xs text-gray-500">per {product.unit}</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stockStatus === 'OUT_OF_STOCK'}
                    className="btn-primary !px-3 !py-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
