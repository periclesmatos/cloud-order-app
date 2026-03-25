import { Route, Routes, useLocation } from 'react-router-dom';
import RequireCustomerAuth from './components/RequireCustomerAuth';
import RequireAdminAuth from './components/RequireAdminAuth';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import CustomerAuthPage from './pages/auth/CustomerAuthPage';
import AdminLoginPage from './pages/admin/auth/AdminLoginPage';
import AdminRegisterPage from './pages/admin/auth/AdminRegisterPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import SuccessPage from './pages/checkout/SuccessPage';
import HomePage from './pages/home/HomePage';
import MyOrdersPage from './pages/orders/MyOrdersPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50">
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/customer/auth" element={<CustomerAuthPage />} />
          <Route
            path="/orders"
            element={
              <RequireCustomerAuth>
                <MyOrdersPage />
              </RequireCustomerAuth>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireCustomerAuth>
                <CheckoutPage />
              </RequireCustomerAuth>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <RequireCustomerAuth>
                <SuccessPage />
              </RequireCustomerAuth>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdminAuth>
                <AdminDashboard />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RequireAdminAuth>
                <AdminProductsPage />
              </RequireAdminAuth>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
