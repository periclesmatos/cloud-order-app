import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, TrendingUp, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import { getDashboardStats } from '../../service/dashboardService';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { formatCurrency } from '../../utils/format';
import { getOrderStatusLabel } from '../../utils/orderStatus';

function StatCard({ icon: Icon, label, value, trend = null, gradient = 'from-blue-500 to-blue-600' }) {
  return (
    <article className={`card overflow-hidden p-6 transition hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-md`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </article>
  );
}

function OrderStatusChart({ orders }) {
  if (!orders.length) {
    return (
      <article className="card p-6">
        <h3 className="font-bold text-slate-900">Pedidos por Status</h3>
        <p className="mt-4 text-sm text-slate-500">Nenhum pedido encontrado.</p>
      </article>
    );
  }

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

  const statusBarColors = {
    CREATED: 'bg-blue-500',
    SENT: 'bg-amber-500',
    COMPLETED: 'bg-emerald-500',
    CANCELED: 'bg-rose-500',
  };

  const statusBgColors = {
    CREATED: 'bg-blue-50 text-blue-700',
    SENT: 'bg-amber-50 text-amber-700',
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    CANCELED: 'bg-rose-50 text-rose-700',
  };

  return (
    <article className="card p-6">
      <h3 className="text-lg font-bold text-slate-900">Distribuição de Pedidos</h3>
      <div className="mt-8 space-y-5">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBgColors[status]}`}>
                    {getOrderStatusLabel(status)}
                  </span>
                  <span className="text-sm font-medium text-slate-600">{count}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{percentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full transition-all duration-500 ${statusBarColors[status]}`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
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
        <h3 className="text-lg font-bold text-slate-900">Estoque Baixo</h3>
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-emerald-50 py-12">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <p className="mt-3 text-sm font-medium text-emerald-700">Nenhum produto com estoque baixo</p>
          <p className="mt-1 text-xs text-emerald-600">Todos os produtos estão com estoque normal.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="card p-6">
      <h3 className="text-lg font-bold text-slate-900">Produtos com Estoque Baixo (≤ 5 unidades)</h3>
      <div className="mt-6 space-y-2">
        {lowStockItems.slice(0, 5).map((product, index) => {
          const stock = Number(product.amount);
          const isVeryLow = stock <= 2;
          return (
            <div key={product.id} className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${
              isVeryLow 
                ? 'border-red-200 bg-red-50' 
                : 'border-amber-200 bg-amber-50 hover:border-amber-300'
            }`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-sm font-bold text-white">
                {stock}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${isVeryLow ? 'text-red-700' : 'text-amber-700'}`}>
                  {product.name}
                </p>
                <p className={`text-xs ${isVeryLow ? 'text-red-600' : 'text-amber-600'}`}>
                  {formatCurrency(product.price)}
                </p>
              </div>
              {isVeryLow && (
                <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                  <span className="text-xs font-bold text-red-600">CRÍTICO</span>
                </div>
              )}
            </div>
          );
        })}
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
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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
        const errorMsg = err?.response?.data?.error || 'Erro ao carregar dados da dashboard.';
        
        if (status === 401 || status === 403) {
          clearSession();
          navigate('/admin/login');
          return;
        }
        
        setError(errorMsg);
        console.error('Erro ao carregar dashboard:', status, err?.response?.data);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accessToken, clearSession, navigate]);

  // Função para filtrar pedidos por período de tempo
  const getFilteredOrders = useMemo(() => {
    if (!data.orders.length) return [];

    const now = new Date();
    return data.orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

      let timeMatches = true;
      if (timeFilter === '7days') timeMatches = daysDiff <= 7;
      else if (timeFilter === '30days') timeMatches = daysDiff <= 30;
      else if (timeFilter === '90days') timeMatches = daysDiff <= 90;

      const statusMatches = statusFilter === 'all' || order.status === statusFilter;

      return timeMatches && statusMatches;
    });
  }, [data.orders, timeFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = getFilteredOrders.length || 0;
    const completedOrders = getFilteredOrders.filter((o) => o.status === 'COMPLETED').length || 0;
    const totalRevenue = getFilteredOrders
      .filter((o) => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalProducts = data.products.filter((p) => p.isActive).length || 0;
    const totalCustomers = data.customers.length || 0;
    const lowStockCount = data.products.filter((p) => Number(p.amount) <= 5).length || 0;

    return {
      totalOrders,
      completedOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      lowStockCount,
    };
  }, [getFilteredOrders, data.products, data.customers]);

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
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Painel Administrativo</p>
        <h1 className="section-title mt-2">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Bem-vindo, <span className="font-semibold text-slate-900">{user?.name || 'Administrador'}</span>!</p>
      </section>

      {error && (
        <section className="card p-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </section>
      )}

      <section className="card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Período</label>
            <select 
              className="input" 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">Todos os períodos</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status do Pedido</label>
            <select 
              className="input" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="CREATED">Criado</option>
              <option value="SENT">Enviado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          icon={Package} 
          label="Total de Pedidos" 
          value={stats.totalOrders} 
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Pedidos Finalizados" 
          value={stats.completedOrders} 
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Receita (Completos)" 
          value={formatCurrency(stats.totalRevenue)} 
          gradient="from-amber-500 to-amber-600"
        />
        <StatCard 
          icon={ShoppingCart} 
          label="Produtos Ativos" 
          value={stats.totalProducts} 
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard 
          icon={Users} 
          label="Total de Clientes" 
          value={stats.totalCustomers} 
          gradient="from-pink-500 to-pink-600"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Estoque Baixo" 
          value={stats.lowStockCount} 
          trend="Requer atenção" 
          gradient="from-red-500 to-red-600"
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        {getFilteredOrders.length > 0 ? <OrderStatusChart orders={getFilteredOrders} /> : <article className="card p-6">Nenhum pedido encontrado</article>}
        {data.products.length > 0 ? <LowStockProducts products={data.products} /> : <article className="card p-6">Nenhum produto encontrado</article>}
      </section>
    </div>
  );
}
