import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { roleDashboardPaths } from '../../utils/helpers';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(roleDashboardPaths[user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 lg:flex lg:flex-col lg:justify-center lg:p-12">
        <div className="flex items-center gap-3 text-white">
          <Leaf className="h-10 w-10" />
          <span className="text-3xl font-bold">Agri Supply</span>
        </div>
        <h2 className="mt-8 text-4xl font-bold leading-tight text-white">
          Agricultural Products Supply Management
        </h2>
        <p className="mt-4 text-lg text-primary-100">
          Streamline your agricultural supply chain with our comprehensive ERP platform.
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:hidden">
              <Leaf className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold">Agri Supply</span>
            </div>
            <button onClick={toggleTheme} className="btn-secondary !px-3 !py-2 text-xs">
              {isDark ? 'Light' : 'Dark'}
            </button>
          </div>

          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-2 text-gray-500">Enter your credentials to access your dashboard</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:underline">
              Register
            </Link>
          </p>

          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800">
            <p className="font-medium text-gray-700 dark:text-gray-300">Demo accounts:</p>
            <p className="mt-1">admin@agrisupply.com / password123</p>
            <p>supplier@agrisupply.com / password123</p>
            <p>farmer@agrisupply.com / password123</p>
            <p>customer@agrisupply.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
