import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

export default function RequireAdminAuth({ children }) {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
