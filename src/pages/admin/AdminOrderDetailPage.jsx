import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, DollarSign, Package, User, Send, Check, Ban, AlertTriangle } from 'lucide-react';
import { getOrderById, updateOrderStatus } from '../../service/orderService';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useToast } from '../../hooks/useToast';
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

export default function AdminOrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const clearSession = useAdminAuthStore((state) => state.clearSession);
  const { success: toastSuccess, error: toastError } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const fetchedOrder = await getOrderById(orderId, accessToken);
      setOrder(fetchedOrder);
    } catch (err) {
      const status = err?.response?.status;
      const errorMsg = err?.response?.data?.error || 'Erro ao carregar pedido.';

      if (status === 401 || status === 403) {
        clearSession();
        navigate('/admin/login');
        return;
      }

      setError(errorMsg);
      console.error('Erro ao carregar pedido:', status, err?.response?.data);
    } finally {
      setLoading(false);
    }
  }, [orderId, accessToken, clearSession, navigate]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status || order.status === 'COMPLETED') {
      return;
    }

    setUpdating(true);
    setError('');

    try {
      await updateOrderStatus(orderId, newStatus, accessToken);
      setOrder((prevOrder) => ({ ...prevOrder, status: newStatus }));
      toastSuccess(`Pedido atualizado para ${newStatus}`);
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Erro ao atualizar status.';
      setError(errorMsg);
      toastError(errorMsg);
      console.error('Erro ao atualizar pedido:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-slate-600">Carregando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Pedidos
        </button>
        <div className="card p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{error || 'Pedido não encontrado'}</p>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === 'COMPLETED';
  const isCanceled = order.status === 'CANCELED';
  const totalItems = order.totalItems || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Pedidos
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Pedido #{order.id}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {error && (
        <div className="card p-4 bg-rose-50 border-2 border-rose-200">
          <p className="text-sm font-medium text-rose-600">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações Básicas */}
        <section className="lg:col-span-2 space-y-6">
          {/* Dados do Pedido */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Informações do Pedido</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Data</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <p className="font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Hora</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <p className="font-semibold text-slate-900">
                    {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Total</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <p className="font-semibold text-slate-900 text-lg">{formatCurrency(order.totalAmount || 0)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Quantidade de Itens</p>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400" />
                  <p className="font-semibold text-slate-900 text-lg">{totalItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Dados do Cliente</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">ID do Cliente</p>
                  <p className="font-semibold text-slate-900">{order.customerId}</p>
                </div>
              </div>
              {order.deliveryAddress && (
                <>
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Endereço de Entrega</p>
                      <p className="font-semibold text-slate-900">
                        {order.deliveryAddress.street}, {order.deliveryAddress.neighborhood}
                      </p>
                      <p className="text-sm text-slate-600">
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
                      </p>
                      {order.deliveryAddress.complement && <p className="text-sm text-slate-600">{order.deliveryAddress.complement}</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Itens do Pedido</h2>
            {order.items && order.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-2 font-semibold text-slate-900">Produto</th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-900">Quantidade</th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-900">Preço</th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-900">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.productId} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2">{item.productName}</td>
                        <td className="py-3 px-2 text-right">{item.quantity}</td>
                        <td className="py-3 px-2 text-right">{formatCurrency(item.unitPrice || 0)}</td>
                        <td className="py-3 px-2 text-right font-semibold text-slate-900">{formatCurrency(item.lineTotal || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-600">Nenhum item neste pedido</p>
            )}
          </div>
        </section>

        {/* Ações */}
        <section className="card p-6 h-fit sticky top-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Ações</h2>

          <div className="space-y-3">
            {isCompleted && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                <p className="text-sm font-semibold text-emerald-700">✓ Pedido Concluído</p>
                <p className="text-xs text-emerald-600 mt-1">Não é possível alterar este pedido</p>
              </div>
            )}

            {isCanceled && (
              <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-lg">
                <p className="text-sm font-semibold text-rose-700">✗ Pedido Cancelado</p>
                <p className="text-xs text-rose-600 mt-1">Não é possível alterar este pedido</p>
              </div>
            )}

            {!isCompleted && !isCanceled && (
              <>
                {order.status === 'CREATED' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('SENT')}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-400 hover:bg-blue-500 text-white font-semibold transition disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {updating ? 'Enviando...' : 'Enviar Pedido'}
                    </button>
                    <button
                      onClick={() => handleStatusChange('CANCELED')}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-rose-400 hover:bg-rose-500 text-white font-semibold transition disabled:opacity-50"
                    >
                      <Ban className="h-4 w-4" />
                      {updating ? 'Cancelando...' : 'Cancelar Pedido'}
                    </button>
                  </>
                )}

                {order.status === 'SENT' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('COMPLETED')}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-400 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {updating ? 'Concluindo...' : 'Marcar como Concluído'}
                    </button>
                    <button
                      onClick={() => handleStatusChange('CANCELED')}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-rose-400 hover:bg-rose-500 text-white font-semibold transition disabled:opacity-50"
                    >
                      <Ban className="h-4 w-4" />
                      {updating ? 'Cancelando...' : 'Cancelar Pedido'}
                    </button>
                  </>
                )}
              </>
            )}

            <button
              onClick={() => navigate('/admin/orders')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
