import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  Warehouse,
  BarChart3,
  FileText,
  LogOut,
  X,
  Sun,
  Moon,
  Leaf,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const navItems = {
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/suppliers', icon: Truck, label: 'Suppliers' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
    { to: '/admin/deliveries', icon: Truck, label: 'Deliveries' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  ],
  SUPPLIER: [
    { to: '/supplier', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/supplier/products', icon: Package, label: 'Products' },
    { to: '/supplier/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/supplier/deliveries', icon: Truck, label: 'Deliveries' },
    { to: '/supplier/inventory', icon: Warehouse, label: 'Inventory' },
  ],
  FARMER: [
    { to: '/farmer', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/farmer/products', icon: Package, label: 'My Products' },
    { to: '/farmer/sales', icon: BarChart3, label: 'Sales & Earnings' },
  ],
  CUSTOMER: [
    { to: '/customer', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/customer/products', icon: Package, label: 'Browse Products' },
    { to: '/customer/cart', icon: ShoppingCart, label: 'Cart' },
    { to: '/customer/orders', icon: Truck, label: 'My Orders' },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems[user?.role] || [];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const syncSidebar = (event) => {
      setSidebarOpen(event.matches);
    };

    syncSidebar(mediaQuery);
    mediaQuery.addEventListener('change', syncSidebar);
    return () => mediaQuery.removeEventListener('change', syncSidebar);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay — fade in/out */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out lg:hidden ${
          sidebarOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar — slide on mobile, width transition on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
          sidebarOpen
            ? 'w-64 translate-x-0 opacity-100'
            : 'w-64 -translate-x-full opacity-0 lg:w-0 lg:translate-x-0 lg:opacity-100 lg:border-transparent'
        }`}
      >
        <div className="flex h-full w-64 min-w-64 flex-col">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div
              className={`min-w-0 flex-1 transition-opacity duration-300 ease-in-out ${
                sidebarOpen ? 'opacity-100 delay-75' : 'opacity-0 lg:opacity-0'
              }`}
            >
              <h1 className="truncate text-sm font-bold text-gray-900 dark:text-white">Agri Supply</h1>
              <p className="truncate text-xs capitalize text-gray-500">{user?.role?.toLowerCase()}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`ml-auto rounded-lg p-1.5 text-gray-500 transition-opacity duration-200 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav
            className={`flex-1 space-y-1 overflow-y-auto p-4 transition-opacity duration-300 ease-in-out ${
              sidebarOpen ? 'opacity-100 delay-100' : 'opacity-0 lg:opacity-0'
            }`}
          >
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeSidebarOnMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div
            className={`shrink-0 border-t border-gray-200 p-4 transition-opacity duration-300 ease-in-out dark:border-gray-800 ${
              sidebarOpen ? 'opacity-100 delay-100' : 'opacity-0 lg:opacity-0'
            }`}
          >
            <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="truncate text-sm font-medium">{user?.fullName}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin,padding] duration-300 ease-in-out`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 lg:px-8">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-500 transition-all duration-200 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <span className="relative block h-5 w-5">
              <PanelLeftClose
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out ${
                  sidebarOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-75 opacity-0'
                }`}
              />
              <PanelLeftOpen
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out ${
                  sidebarOpen ? '-rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
            </span>
          </button>
          <div className="flex-1" />
          <NotificationBell />
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
