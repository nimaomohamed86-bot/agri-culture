import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    const paths = { ADMIN: '/admin', SUPPLIER: '/supplier', FARMER: '/farmer', CUSTOMER: '/customer' };
    return <Navigate to={paths[user.role] || '/login'} replace />;
  }

  return <Outlet />;
}
