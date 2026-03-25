import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, CheckCircle2, TrendingUp, ShoppingCart, Users, AlertTriangle, ArrowRight, Calendar, X, ChevronDown } from 'lucide-react';
import { getDashboardStats } from '../../service/dashboardService';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { formatCurrency } from '../../utils/format';
import { getOrderStatusLabel } from '../../utils/orderStatus';

function StatCard({ icon: Icon, label, value, trend = null, gradient = 'from-blue-500 to-blue-600' }) {
  return (
    <article className="card overflow-hidden p-3 transition hover:shadow-lg border border-slate-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
          {trend && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-md`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </article>
  );
}

function QuickStatusChart({ orders }) {
  const statusCounts = useMemo(() => {
    const counts = { CREATED: 0, SENT: 0, COMPLETED: 0, CANCELED: 0 };
    orders.forEach((order) => {
      if (Object.prototype.hasOwnProperty.call(counts, order.status)) counts[order.status]++;
    });
    return counts;
  }, [orders]);

  const statusColors = {
    CREATED: { bar: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700' },
    SENT: { bar: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700' },
    COMPLETED: { bar: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700' },
    CANCELED: { bar: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700' },
  };

  return (
    <article className="card p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Status dos Pedidos</h3>
      <div className="space-y-3">
        {Object.entries(statusCounts).map(([status, count]) => {
          const total = orders.length || 1;
          const percentage = Math.round((count / total) * 100);
          const config = statusColors[status];
          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.bg}`}>{getOrderStatusLabel(status)}</span>
                <span className="text-sm font-bold text-slate-900">{count}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${config.bar} transition-all`} style={{ width: `${percentage}%` }} />
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
    return products
      .filter((p) => Number(p.amount) <= 5)
      .sort((a, b) => Number(a.amount) - Number(b.amount))
      .slice(0, 5);
  }, [products]);

  if (!lowStockItems.length) {
    return (
      <article className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Estoque Baixo</h3>
        <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-lg">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-2" />
          <p className="text-sm text-emerald-700">Nenhum produto com estoque baixo</p>
        </div>
      </article>
    );
  }

  return (
    <article className="card p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Produtos com Estoque Baixo</h3>
      <div className="space-y-2">
        {lowStockItems.map((product) => {
          const stock = Number(product.amount);
          const isVeryLow = stock <= 2;
          return (
            <div
              key={product.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                isVeryLow ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex-1">
                <p className={`font-semibold text-sm ${isVeryLow ? 'text-red-700' : 'text-amber-700'}`}>{product.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${isVeryLow ? 'text-red-600' : 'text-amber-600'}`}>{stock} un</span>
                {isVeryLow && <AlertTriangle className="h-4 w-4 text-red-600" />}
              </div>
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showQuickPeriod, setShowQuickPeriod] = useState(false);

  const loadData = useCallback(async () => {
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
  }, [accessToken, clearSession, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDateToInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleQuickPeriod = (period) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    if (period === 'today') {
      setDateFrom(formatDateToInput(today));
      setDateTo(formatDateToInput(today));
    } else if (period === '7days') {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      setDateFrom(formatDateToInput(startDate));
      setDateTo(formatDateToInput(today));
    } else if (period === '30days') {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      setDateFrom(formatDateToInput(startDate));
      setDateTo(formatDateToInput(today));
    }
    setShowQuickPeriod(false);
  };

  const stats = useMemo(() => {
    let filteredOrders = data.orders || [];

    if (dateFrom) {
      const [year, month, day] = dateFrom.split('-');
      const fromDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt) >= fromDate);
    }

    if (dateTo) {
      const [year, month, day] = dateTo.split('-');
      const toDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt) <= toDate);
    }

    const totalOrders = filteredOrders.length || 0;
    const completedOrders = filteredOrders.filter((o) => o.status === 'COMPLETED').length || 0;
    const totalRevenue = filteredOrders.filter((o) => o.status === 'COMPLETED').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalProducts = data.products.filter((p) => p.isActive).length || 0;
    const totalCustomers = data.customers.length || 0;

    return {
      totalOrders,
      completedOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
    };
  }, [data.orders, data.products, data.customers, dateFrom, dateTo]);

  if (loading) {
    return (
      <section className="card p-8">
        <p className="text-slate-600">Carregando dashboard...</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-8">
        <section>
          <h1 className="section-title">Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Bem-vindo, <span className="font-semibold text-slate-900">{user?.name || 'Administrador'}</span>!
          </p>
        </section>

        <section className="flex items-center gap-3 flex-wrap justify-end pt-1">
          <div className="relative">
            <button
              onClick={() => setShowQuickPeriod(!showQuickPeriod)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-2 transition ${
                showQuickPeriod
                  ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-md'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              <span>⏰ Período</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showQuickPeriod ? 'rotate-180' : ''}`} />
            </button>
            {showQuickPeriod && (
              <div className="absolute right-0 mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-xl z-10 w-48">
                <button
                  onClick={() => handleQuickPeriod('today')}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 font-medium border-b border-slate-100 transition"
                >
                  📅 Hoje
                </button>
                <button
                  onClick={() => handleQuickPeriod('7days')}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 font-medium border-b border-slate-100 transition"
                >
                  📊 Últimos 7 dias
                </button>
                <button
                  onClick={() => handleQuickPeriod('30days')}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 font-medium transition"
                >
                  📈 Últimos 30 dias
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm border-none outline-none"
            />
          </div>
          <div className="text-sm text-slate-500">até</div>
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm border-none outline-none" />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 ml-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
        </section>
      </div>

      {error && (
        <section className="card p-4 bg-rose-50 border-2 border-rose-200">
          <p className="text-sm font-medium text-rose-600">{error}</p>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Package} label="Total de Pedidos" value={stats.totalOrders} gradient="from-blue-500 to-blue-600" />
        <StatCard icon={CheckCircle2} label="Concluídos" value={stats.completedOrders} gradient="from-emerald-500 to-emerald-600" />
        <StatCard icon={ShoppingCart} label="Produtos" value={stats.totalProducts} gradient="from-purple-500 to-purple-600" />
        <StatCard icon={Users} label="Clientes" value={stats.totalCustomers} gradient="from-pink-500 to-pink-600" />
        <StatCard icon={TrendingUp} label="Receita" value={formatCurrency(stats.totalRevenue)} gradient="from-amber-500 to-amber-600" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <QuickStatusChart orders={data.orders} />
        <LowStockProducts products={data.products} />
      </section>

      <section className="card p-6 bg-gradient-to-r from-blue-50 to-brand-50 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Gerenciar Pedidos</h3>
            <p className="text-sm text-slate-600 mt-1">Visualize e altere o status de todos os pedidos com filtros avançados</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Ir para Pedidos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
