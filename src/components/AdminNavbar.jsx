import { Link } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

export default function AdminNavbar() {
  const user = useAdminAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm ring-1 ring-brand-500/40">
            <span className="text-xl leading-none">⚙️</span>
            <span className="absolute -right-1 -top-1 text-[11px]">🔐</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Cloud Order</p>
            <p className="text-xs text-slate-500">📊 Painel Admin</p>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link to="/admin" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
            Dashboard
          </Link>
          <Link to="/admin/products" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
            Produtos
          </Link>
          <Link to="/" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
            Faça seu pedido
          </Link>
        </nav>

        {user && (
          <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        )}
      </div>
    </header>
  );
}
