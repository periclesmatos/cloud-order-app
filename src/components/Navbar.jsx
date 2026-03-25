import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { useProductStore } from '../store/productStore';

export default function Navbar() {
  const admin = false; // TODO: implementar autenticação real
  const location = useLocation();
  const user = useCustomerAuthStore((state) => state.customer);
  const isAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const clearSession = useCustomerAuthStore((state) => state.clearSession);
  const cart = useProductStore((state) => state.cart);
  const cartItemsCount = Object.values(cart).reduce((acc, quantity) => acc + Number(quantity || 0), 0);

  const isAdminRoute = window.location.pathname.startsWith('/admin');

  const navClassName = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const isCustomerAuthRoute = !isAuthenticated && location.pathname === '/customer/auth';

  const ordersNavClassName = ({ isActive }) => {
    if (isCustomerAuthRoute) {
      return 'rounded-full px-4 py-2 text-sm font-medium transition text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    }

    return navClassName({ isActive });
  };

  const cartNavClassName = ({ isActive }) => {
    if (isCustomerAuthRoute) {
      if (cartItemsCount > 0) {
        return 'rounded-full px-4 py-2 text-sm font-medium transition text-brand-700 bg-brand-50 hover:bg-brand-100';
      }

      return 'rounded-full px-4 py-2 text-sm font-medium transition text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    }

    if (isActive) {
      return 'rounded-full px-4 py-2 text-sm font-medium transition bg-brand-600 text-white';
    }

    if (cartItemsCount > 0) {
      return 'rounded-full px-4 py-2 text-sm font-medium transition text-brand-700 bg-brand-50 hover:bg-brand-100';
    }

    return 'rounded-full px-4 py-2 text-sm font-medium transition text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  };

  const handleAdminLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm ring-1 ring-brand-500/40">
            <span className="text-xl leading-none">📦</span>
            <span className="absolute -right-1 -top-1 text-[11px]">✨</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Cloud Order</p>
            <p className="text-xs text-slate-500">{admin ? '🔒 Painel Admin' : 'Pedidos online com entrega rápida'}</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {admin ? (
            <>
              <NavLink to="/admin" className={navClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/products" className={navClassName}>
                Produtos
              </NavLink>
              <NavLink to="/admin/orders" className={navClassName}>
                Pedidos
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" className={navClassName}>
                Faça seu pedido
              </NavLink>
              <NavLink
                to={isAuthenticated ? '/orders' : '/customer/auth'}
                state={isAuthenticated ? undefined : { from: '/orders' }}
                className={ordersNavClassName}
              >
                Meus pedidos
              </NavLink>
              <NavLink
                to={isAuthenticated ? '/checkout' : '/customer/auth'}
                state={isAuthenticated ? undefined : { from: '/checkout' }}
                className={cartNavClassName}
              >
                Carrinho ({cartItemsCount})
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {admin ? (
            <>
              <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
              <button type="button" onClick={handleAdminLogout} className="btn-secondary px-4 py-2 text-sm">
                Sair
              </button>
            </>
          ) : isAuthenticated && user ? (
            <>
              <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.phone}</p>
              </div>
              <button type="button" onClick={handleAdminLogout} className="btn-secondary px-4 py-2 text-sm">
                Sair
              </button>
            </>
          ) : (
            !isAdminRoute && (
              <Link to="/admin/login" className="btn-primary px-4 py-2 text-sm">
                Painel administrativo
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
