import { Route, Routes } from 'react-router-dom';
import RequireCustomerAuth from './components/RequireCustomerAuth';
import Navbar from './components/Navbar';
import CustomerAuthPage from './pages/auth/CustomerAuthPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import HomePage from './pages/home/HomePage';
import OrdersPage from './pages/orders/OrdersPage';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customer/auth" element={<CustomerAuthPage />} />
          <Route
            path="/orders"
            element={
              <RequireCustomerAuth>
                <OrdersPage />
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
        </Routes>
      </main>
    </div>
  );
}
