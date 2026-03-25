import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAdminAuthStore } from '../store/adminAuthStore';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const user = useAdminAuthStore((state) => state.user);
  const clearSession = useAdminAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    clearSession();
    navigate('/admin/login', { replace: true });
  };

  const navClassName = ({ isActive }) =>
    `rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 text-[11px] sm:text-xs lg:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
      isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 px-2 py-2 sm:gap-3 sm:px-4 lg:px-8 lg:py-3">
        {/* Logo */}
        <Link to="/admin" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-fit">
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm ring-1 ring-brand-500/40">
            <span className="text-base sm:text-lg leading-none">⚙️</span>
            <span className="absolute -right-0.5 -top-0.5 text-[9px] sm:text-[10px]">🔐</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">Cloud Order</p>
            <p className="text-[10px] text-slate-500">Painel</p>
          </div>
        </Link>

        {/* Navigation - Centered */}
        <nav className="flex items-center gap-0.5 sm:gap-1 justify-center">
          <NavLink to="/admin" end className={navClassName} title="Dashboard">
            <span className="hidden md:inline text-xs">Dashboard</span>
            <span className="md:hidden">📊</span>
          </NavLink>
          <NavLink to="/admin/orders" className={navClassName} title="Pedidos">
            <span className="hidden md:inline text-xs">Pedidos</span>
            <span className="md:hidden">📋</span>
          </NavLink>
          <NavLink to="/admin/products" className={navClassName} title="Produtos">
            <span className="hidden lg:inline text-xs">Produtos</span>
            <span className="lg:hidden">📦</span>
          </NavLink>
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 text-[11px] sm:text-xs font-medium transition whitespace-nowrap bg-brand-50 text-brand-700 hover:bg-brand-100 cursor-pointer"
          >
            <span className="hidden md:inline">Voltar </span>
            <span className="md:hidden">🏠</span>
          </button>
          {user && (
            <div className="hidden rounded-lg bg-slate-100 px-2 py-1 text-right sm:flex flex-col">
              <p className="text-xs sm:text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500">Admin</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2 py-1.5 sm:px-3 text-[10px] sm:text-xs font-semibold text-red-700 transition hover:bg-red-100 hover:border-red-400 flex-shrink-0 cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
