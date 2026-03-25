import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuthStore } from '../store/customerAuthStore';

export default function RequireCustomerAuth({ children }) {
  const isAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/customer/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
}
