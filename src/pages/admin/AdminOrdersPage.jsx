import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Filter, X, Clock, Package, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getDashboardStats } from '../../service/dashboardService';
import { updateOrderStatus } from '../../service/orderService';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { formatCurrency } from '../../utils/format';

const ORDER_STATUSES = [
  { value: 'CREATED', label: 'Criado', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'SENT', label: 'Enviado', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'COMPLETED', label: 'Concluído', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'CANCELED', label: 'Cancelado', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

function OrderStatusBadge({ status }) {
  const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${statusConfig.color}`}>{statusConfig.label}</span>
  );
}

function OrderCard({ order, onStatusChange, isUpdating }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const isCompleted = order.status === 'COMPLETED';

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status || isCompleted) return;
    setShowStatusMenu(false);
    await onStatusChange(order.id, newStatus);
  };

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white hover:shadow-lg transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">Pedido #{order.id}</h3>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Data</p>
                  <p className="font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Hora</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(order.totalAmount || 0)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Itens</p>
                  <p className="font-semibold text-slate-900">{order.items?.length || 0}</p>
                </div>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-600 mb-2">Itens:</p>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="text-sm text-slate-600 flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-slate-400">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && <div className="text-xs text-slate-500">+{order.items.length - 3} mais item(ns)</div>}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isCompleted || isUpdating}
              className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition ${
                isCompleted
                  ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isUpdating ? '...' : 'Alterar'}
            </button>

            {showStatusMenu && !isCompleted && (
              <div className="absolute right-0 mt-12 bg-white border-2 border-slate-300 rounded-lg shadow-xl z-10 w-44">
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={order.status === status.value}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      order.status === status.value ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="bg-emerald-50 border-t-2 border-emerald-100 px-5 py-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">Pedido concluído - sem alterações</p>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const clearSession = useAdminAuthStore((state) => state.clearSession);

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const loadData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const stats = await getDashboardStats(accessToken);
      setOrders(stats.orders || []);
      setCustomers(stats.customers || []);
    } catch (err) {
      const status = err?.response?.status;
      const errorMsg = err?.response?.data?.error || 'Erro ao carregar pedidos.';

      if (status === 401 || status === 403) {
        clearSession();
        navigate('/admin/login');
        return;
      }

      setError(errorMsg);
      console.error('Erro ao carregar pedidos:', status, err?.response?.data);
    } finally {
      setLoading(false);
    }
  }, [accessToken, clearSession, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtros aplicados
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.id.toString().includes(searchTerm) || searchTerm === '';
      const matchesStatus = statusFilter === '' || order.status === statusFilter;

      const orderDate = new Date(order.createdAt);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const toDate = dateToFilter ? new Date(dateToFilter) : null;

      let matchesDate = true;
      if (fromDate) {
        matchesDate = matchesDate && orderDate >= fromDate;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= toDate;
      }

      const matchesCustomer = customerFilter === '' || (order.customerId && order.customerId.toString() === customerFilter);

      return matchesSearch && matchesStatus && matchesDate && matchesCustomer;
    });
  }, [orders, searchTerm, statusFilter, dateFromFilter, dateToFilter, customerFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setError('');

    try {
      await updateOrderStatus(orderId, newStatus, accessToken);
      // Atualizar ordem local
      setOrders((prevOrders) => prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Erro ao atualizar status.';
      setError(errorMsg);
      console.error('Erro ao atualizar pedido:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCustomerFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || customerFilter || dateFromFilter || dateToFilter;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-slate-600">Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="section-title">Pedidos</h1>
        <p className="mt-2 text-slate-600">
          Total: <span className="font-semibold">{orders.length}</span> | Filtrados:{' '}
          <span className="font-semibold">{filteredOrders.length}</span>
        </p>
      </section>

      {error && (
        <div className="card p-4 bg-rose-50 border-2 border-rose-200">
          <p className="text-sm font-medium text-rose-600">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-900">Filtros</h3>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="ml-auto text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Busca por ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ID do Pedido</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
              <option value="">Todos os status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Data De */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data De</label>
            <input type="date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} className="input" />
          </div>

          {/* Data Até */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data Até</label>
            <input type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} className="input" />
          </div>

          {/* Cliente */}
          {customers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
              <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="input">
                <option value="">Todos os clientes</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Nenhum pedido encontrado</p>
          <p className="text-sm text-slate-500 mt-1">Tente ajustar os filtros</p>
        </div>
      ) : (
        <section className="grid gap-4">
          <div className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filteredOrders.length}</span> de{' '}
            <span className="font-semibold">{orders.length}</span> pedidos
          </div>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} isUpdating={updatingOrderId === order.id} />
          ))}
        </section>
      )}
    </div>
  );
}
