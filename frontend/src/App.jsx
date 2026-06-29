import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import ReportsPage from './pages/admin/ReportsPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

import SupplierDashboard from './pages/supplier/SupplierDashboard';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowseProductsPage from './pages/customer/BrowseProductsPage';
import CartPage from './pages/customer/CartPage';

import ProductsPage from './pages/shared/ProductsPage';
import OrdersPage from './pages/shared/OrdersPage';
import InventoryPage from './pages/shared/InventoryPage';
import DeliveriesPage from './pages/shared/DeliveriesPage';
import LandingPage from './pages/landing/LandingPage';

function RootRedirect() {
  const { user, loading, getDashboardPath } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary-50 dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }
  if (user) return <Navigate to={getDashboardPath()} replace />;
  return <LandingPage />;
}

function DashboardWrapper({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin" element={<DashboardWrapper><AdminDashboard /></DashboardWrapper>} />
              <Route path="/admin/users" element={<DashboardWrapper><UsersPage /></DashboardWrapper>} />
              <Route path="/admin/products" element={<DashboardWrapper><ProductsPage /></DashboardWrapper>} />
              <Route path="/admin/suppliers" element={<DashboardWrapper><SuppliersPage /></DashboardWrapper>} />
              <Route path="/admin/orders" element={<DashboardWrapper><OrdersPage adminMode /></DashboardWrapper>} />
              <Route path="/admin/inventory" element={<DashboardWrapper><InventoryPage /></DashboardWrapper>} />
              <Route path="/admin/deliveries" element={<DashboardWrapper><DeliveriesPage /></DashboardWrapper>} />
              <Route path="/admin/reports" element={<DashboardWrapper><ReportsPage /></DashboardWrapper>} />
              <Route path="/admin/audit-logs" element={<DashboardWrapper><AuditLogsPage /></DashboardWrapper>} />
            </Route>

            {/* Supplier Routes */}
            <Route element={<ProtectedRoute roles={['SUPPLIER']} />}>
              <Route path="/supplier" element={<DashboardWrapper><SupplierDashboard /></DashboardWrapper>} />
              <Route path="/supplier/products" element={<DashboardWrapper><ProductsPage /></DashboardWrapper>} />
              <Route path="/supplier/orders" element={<DashboardWrapper><OrdersPage supplierMode /></DashboardWrapper>} />
              <Route path="/supplier/deliveries" element={<DashboardWrapper><DeliveriesPage /></DashboardWrapper>} />
              <Route path="/supplier/inventory" element={<DashboardWrapper><InventoryPage /></DashboardWrapper>} />
            </Route>

            {/* Farmer Routes */}
              <Route element={<ProtectedRoute roles={['ADMIN', 'FARMER']} />}>
              <Route path="/farmer" element={<DashboardWrapper><FarmerDashboard /></DashboardWrapper>} />
              <Route path="/farmer/products" element={<DashboardWrapper><ProductsPage farmerMode /></DashboardWrapper>} />
              <Route path="/farmer/sales" element={<DashboardWrapper><FarmerDashboard /></DashboardWrapper>} />
            </Route>

            {/* Customer Routes */}
            <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
              <Route path="/customer" element={<DashboardWrapper><CustomerDashboard /></DashboardWrapper>} />
              <Route path="/customer/products" element={<DashboardWrapper><BrowseProductsPage /></DashboardWrapper>} />
              <Route path="/customer/cart" element={<DashboardWrapper><CartPage /></DashboardWrapper>} />
              <Route path="/customer/orders" element={<DashboardWrapper><OrdersPage /></DashboardWrapper>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
