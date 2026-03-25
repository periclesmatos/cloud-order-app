import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useCustomerAuthStore } from '../store/customerAuthStore';

export default function RequireAdminAuth({ children }) {
  const adminIsAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const customerIsAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  // Se cliente está autenticado, bloquear acesso às páginas de admin
  if (customerIsAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se admin não está autenticado, redirecionar para login de admin
  if (!adminIsAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
