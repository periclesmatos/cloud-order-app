import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useProductStore } from '../store/productStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCustomerAuthStore((state) => state.customer);
  const isAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const clearSession = useCustomerAuthStore((state) => state.clearSession);
  const adminIsAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const cart = useProductStore((state) => state.cart);
  const cartItemsCount = Object.values(cart).reduce((acc, quantity) => acc + Number(quantity || 0), 0);

  const isAdminRoute = window.location.pathname.startsWith('/admin');

  const navClassName = ({ isActive }) =>
    `rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 text-[11px] sm:text-xs lg:text-sm font-medium transition whitespace-nowrap ${
      isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const isCustomerAuthRoute = !isAuthenticated && location.pathname === '/customer/auth';

  const ordersNavClassName = ({ isActive }) => {
    if (isCustomerAuthRoute) {
      return 'rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 text-[11px] sm:text-xs lg:text-sm font-medium transition whitespace-nowrap text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    }

    return navClassName({ isActive });
  };

  const cartNavClassName = ({ isActive }) => {
    if (isCustomerAuthRoute) {
      if (cartItemsCount > 0) {
        return 'rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 text-[11px] sm:text-xs lg:text-sm font-medium transition whitespace-nowrap text-brand-700 bg-brand-50 hover:bg-brand-100';
      }

      return 'rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 text-[11px] sm:text-xs lg:text-sm font-medium transition whitespace-nowrap text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    }

    if (isActive) {
      return 'rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 text-[11px] sm:text-xs lg:text-sm font-medium transition whitespace-nowrap bg-brand-600 text-white';
    }

    if (cartItemsCount > 0) {
      return 'rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 text-[11px] sm:text-xs lg:text-sm font-medium transition whitespace-nowrap text-brand-700 bg-brand-50 hover:bg-brand-100';
    }

    return 'rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 text-[11px] sm:text-xs lg:text-sm font-medium transition whitespace-nowrap text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  };

  const handleAdminLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  const handleAdminClick = () => {
    if (adminIsAuthenticated) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 px-2 py-2 sm:gap-3 sm:px-4 lg:px-8 lg:py-3">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-fit">
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm ring-1 ring-brand-500/40">
            <span className="text-sm sm:text-lg leading-none">📦</span>
            <span className="absolute -right-1 -top-1 text-[8px] sm:text-[10px]">✨</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm sm:text-base font-bold text-slate-900">Cloud Order</p>
            <p className="text-[10px] text-slate-500">Pedidos com entrega</p>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 justify-center">
          <NavLink to="/" className={navClassName}>
            <span className="hidden md:inline">Faça seu pedido</span>
            <span className="md:hidden">🛒</span>
          </NavLink>
          <NavLink
            to={isAuthenticated ? '/orders' : '/customer/auth'}
            state={isAuthenticated ? undefined : { from: '/orders' }}
            className={ordersNavClassName}
          >
            <span className="hidden md:inline">Meus pedidos</span>
            <span className="md:hidden">📋</span>
          </NavLink>
          <NavLink
            to={isAuthenticated ? '/checkout' : '/customer/auth'}
            state={isAuthenticated ? undefined : { from: '/checkout' }}
            className={cartNavClassName}
          >
            <span className="hidden md:inline">Carrinho</span>
            <span className="md:hidden">🛍️</span>
            <span className="text-[10px] sm:text-xs ml-0.5 sm:ml-1">({cartItemsCount})</span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-fit">
          {isAuthenticated && user ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-primary px-1.5 py-1 sm:px-2 sm:py-1.5 text-[11px] sm:text-xs whitespace-nowrap"
              >
                <span className="hidden md:inline">Home</span>
                <span className="md:hidden">🏠</span>
              </button>
              <div className="hidden rounded-2xl bg-slate-100 px-2 py-1 sm:px-3 sm:py-2 text-right md:block">
                <p className="text-xs sm:text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.phone?.slice(-4)}</p>
              </div>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="btn-secondary px-1.5 py-1 sm:px-2 sm:py-1.5 text-[11px] sm:text-xs whitespace-nowrap"
              >
                Sair
              </button>
            </>
          ) : (
            !isAdminRoute && (
              <button
                type="button"
                onClick={handleAdminClick}
                className="btn-primary px-1.5 py-1 sm:px-2 sm:py-1.5 text-[11px] sm:text-xs whitespace-nowrap"
              >
                <span className="hidden md:inline">Painel Admin</span>
                <span className="md:hidden">👨‍💼</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
