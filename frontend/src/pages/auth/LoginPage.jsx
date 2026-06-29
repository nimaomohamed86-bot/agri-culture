import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { roleDashboardPaths } from '../../utils/helpers';

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* Left Side */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-green-900 lg:flex lg:flex-col lg:justify-center lg:p-16">

        <div className="absolute right-20 top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <Leaf className="h-12 w-12" />
            <span className="text-4xl font-extrabold">
              Agri Supply
            </span>
          </div>

          <h2 className="mt-8 text-5xl font-extrabold leading-tight text-white">
            Agricultural Products
            <br />
            Supply Management
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-green-100">
            Streamline your agricultural supply chain with our
            comprehensive ERP platform.
          </p>

          <div className="mt-10 space-y-3 text-green-100">
            <p>✓ Inventory Management</p>
            <p>✓ Supplier Management</p>
            <p>✓ Farmer Portal</p>
            <p>✓ Customer Orders</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">

        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">

            <div className="flex items-center gap-2 lg:hidden">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold">
                Agri Supply
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium transition hover:shadow-md dark:border-gray-700"
            >
              {isDark ? '☀ Light' : '🌙 Dark'}
            </button>

          </div>

          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">
            Welcome LOGIN 👋
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Sign in to access your dashboard
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-gray-200">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 transition-all duration-300 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-gray-200">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-12 transition-all duration-300 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-green-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogIn size={18} />

              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Back Home Button */}
            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={18} />
              Back To Home
            </Link>

          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-green-600 hover:underline"
            >
              Register
            </Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm shadow-sm dark:border-green-900 dark:bg-green-950/20">

            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Demo Accounts
            </p>

            <div className="mt-3 space-y-1 text-gray-600 dark:text-gray-400">
              <p>admin@agrisupply.com / password123</p>
              <p>supplier@agrisupply.com / password123</p>
              <p>farmer@agrisupply.com / password123</p>
              <p>customer@agrisupply.com / password123</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

