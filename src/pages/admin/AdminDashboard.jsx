import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../service/dashboardService';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { formatCurrency } from '../../utils/format';
import { getOrderStatusLabel } from '../../utils/orderStatus';

function StatCard({ icon, label, value, trend = null }) {
  return (
    <article className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {trend && <p className="mt-2 text-xs text-emerald-600">↑ {trend}</p>}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </article>
  );
}

function OrderStatusChart({ orders }) {
  const statusCounts = useMemo(() => {
    const counts = {
      CREATED: 0,
      SENT: 0,
      COMPLETED: 0,
      CANCELED: 0,
    };

    orders.forEach((order) => {
      if (counts.hasOwnProperty(order.status)) {
        counts[order.status]++;
      }
    });

    return counts;
  }, [orders]);

  const statusColors = {
    CREATED: 'bg-blue-50 text-blue-700',
    SENT: 'bg-amber-50 text-amber-700',
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    CANCELED: 'bg-rose-50 text-rose-700',
  };

  return (
    <article className="card p-6">
      <h3 className="font-bold text-slate-900">Pedidos por Status</h3>
      <div className="mt-6 space-y-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status]}`}>
                {getOrderStatusLabel(status)}
              </span>
              <span className="text-sm text-slate-600">{count} pedido{count !== 1 ? 's' : ''}</span>
            </div>
            <span className="font-bold text-slate-900">{Math.round((count / orders.length) * 100)}%</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function LowStockProducts({ products }) {
  const lowStockItems = useMemo(() => {
    return products.filter((p) => Number(p.amount) <= 5).sort((a, b) => Number(a.amount) - Number(b.amount));
  }, [products]);

  if (!lowStockItems.length) {
    return (
      <article className="card p-6">
        <h3 className="font-bold text-slate-900">Estoque Baixo</h3>
        <p className="mt-4 text-sm text-slate-500">Todos os produtos estao com estoque normal.</p>
      </article>
    );
  }

  return (
    <article className="card p-6">
      <h3 className="font-bold text-slate-900">Estoque Baixo (≤ 5 unidades)</h3>
      <div className="mt-4 space-y-3">
        {lowStockItems.slice(0, 5).map((product) => (
          <div key={product.id} className="flex items-center justify-between rounded-lg bg-red-50 p-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-500">{formatCurrency(product.price)}</p>
            </div>
            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">{product.amount} un</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const user = useAdminAuthStore((state) => state.user);
  const clearSession = useAdminAuthStore((state) => state.clearSession);

  const [data, setData] = useState({ orders: [], products: [], customers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const stats = await getDashboardStats(accessToken);
        setData(stats);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          clearSession();
          navigate('/admin/login');
          return;
        }
        setError('Erro ao carregar dados da dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accessToken, clearSession, navigate]);

  const stats = useMemo(() => {
    const totalOrders = data.orders.length;
    const completedOrders = data.orders.filter((o) => o.status === 'COMPLETED').length;
    const totalRevenue = data.orders
      .filter((o) => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalProducts = data.products.filter((p) => p.isActive).length;
    const totalCustomers = data.customers.length;
    const lowStockCount = data.products.filter((p) => Number(p.amount) <= 5).length;

    return {
      totalOrders,
      completedOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      lowStockCount,
    };
  }, [data]);

  const handleLogout = () => {
    clearSession();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <section className="card p-8">
        <p className="text-slate-600">Carregando dashboard...</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Painel</p>
          <h1 className="section-title mt-2">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Bem-vindo, {user?.name || 'Administrador'}!</p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary px-4 py-2 text-sm">
          Sair
        </button>
      </section>

      {error && (
        <section className="card p-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard icon="📦" label="Total de Pedidos" value={stats.totalOrders} />
        <StatCard icon="✅" label="Pedidos Finalizados" value={stats.completedOrders} />
        <StatCard icon="💰" label="Receita (Completos)" value={formatCurrency(stats.totalRevenue)} />
        <StatCard icon="🛒" label="Produtos Ativos" value={stats.totalProducts} />
        <StatCard icon="👥" label="Total de Clientes" value={stats.totalCustomers} />
        <StatCard icon="⚠️" label="Estoque Baixo" value={stats.lowStockCount} trend="Requer atencao" />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        {data.orders.length > 0 ? <OrderStatusChart orders={data.orders} /> : <article className="card p-6">Nenhum pedido encontrado</article>}
        {data.products.length > 0 ? <LowStockProducts products={data.products} /> : <article className="card p-6">Nenhum produto encontrado</article>}
      </section>
    </div>
  );
}
