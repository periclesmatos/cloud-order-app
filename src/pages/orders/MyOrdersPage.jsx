import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../home/components/EmptyState';
import { cancelOrder, getCustomerOrders } from '../../service/orderService';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { useValidateMe } from '../../hooks/useValidateMe';
import { ORDER_STATUS_OPTIONS } from '../../utils/orderStatus';
import OrderCard from './components/OrderCard';

function normalizeOrder(order) {
  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    total: Number(order.totalAmount || 0),
    items: (order.items || []).map((item) => ({
      id: item.productId,
      name: item.productName,
      quantity: item.quantity,
      subtotal: Number(item.lineTotal || 0),
    })),
  };
}

function canCancel(status) {
  return status !== 'SENT' && status !== 'COMPLETED' && status !== 'CANCELED';
}

export default function MyOrdersPage() {
  const customer = useCustomerAuthStore((state) => state.customer);
  const accessToken = useCustomerAuthStore((state) => state.accessToken);

  // ✅ Valida dados do cliente com servidor na montagem
  // Se token estiver inválido, limpa sessão automaticamente
  useValidateMe(true);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingOrderId, setProcessingOrderId] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      if (!customer?.id || !accessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await getCustomerOrders(customer.id, accessToken);
        const normalized = data.map(normalizeOrder);
        setOrders(normalized);
      } catch (err) {
        setError(err?.response?.data?.error || 'Nao foi possivel carregar seus pedidos.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [customer?.id, accessToken]);

  const filteredOrders = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const result = orders.filter((order) => {
      const statusMatches = statusFilter === 'ALL' || order.status === statusFilter;

      const textMatches =
        !query || order.id.toLowerCase().includes(query) || order.items.some((item) => item.name.toLowerCase().includes(query));

      return statusMatches && textMatches;
    });

    return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchText, statusFilter]);

  function handleRequestCancelOrder(order) {
    if (!canCancel(order.status)) {
      return;
    }

    setOrderToCancel(order);
  }

  async function handleConfirmCancelOrder() {
    if (!orderToCancel || !canCancel(orderToCancel.status) || !accessToken) {
      return;
    }

    setProcessingOrderId(orderToCancel.id);
    setError('');

    try {
      const updated = await cancelOrder(orderToCancel.id, accessToken);

      setOrders((current) =>
        current.map((currentOrder) => (currentOrder.id === orderToCancel.id ? normalizeOrder(updated) : currentOrder)),
      );
      setOrderToCancel(null);
    } catch (err) {
      setError(err?.response?.data?.error || 'Nao foi possivel cancelar o pedido.');
    } finally {
      setProcessingOrderId('');
    }
  }

  if (loading) {
    return (
      <section className="card p-6">
        <p className="text-slate-600">Buscando seus pedidos...</p>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <EmptyState
        title="Nenhum pedido encontrado"
        description="Assim que voce finalizar um pedido, o historico aparecera aqui com data, itens, total e status."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Historico</p>
        <h1 className="section-title mt-2">Pedidos de {customer?.name || 'cliente'}</h1>
      </div>

      <section className="card p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            className="input"
            placeholder="Buscar por codigo do pedido ou item"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <section className="card p-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </section>
      )}

      {!filteredOrders.length ? (
        <EmptyState title="Nenhum resultado" description="Tente ajustar os filtros de busca para localizar um pedido." compact />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              footer={
                <button
                  type="button"
                  onClick={() => handleRequestCancelOrder(order)}
                  disabled={!canCancel(order.status) || processingOrderId === order.id}
                  className="btn-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {order.status === 'CANCELED'
                    ? 'Pedido cancelado'
                    : processingOrderId === order.id
                      ? 'Cancelando...'
                      : canCancel(order.status)
                        ? 'Cancelar pedido'
                        : 'Nao cancelavel'}
                </button>
              }
            />
          ))}
        </div>
      )}

      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="card w-full max-w-xl p-7 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Confirmacao de cancelamento</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Tem certeza que deseja cancelar este pedido?</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              O pedido <span className="font-semibold text-slate-900">{orderToCancel.id}</span> sera marcado como{' '}
              <span className="font-semibold text-rose-600">Cancelado</span> e essa acao nao podera ser desfeita.
            </p>
            <p className="mt-2 text-sm text-slate-500">Se voce ainda quiser receber este pedido, clique em Voltar.</p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => setOrderToCancel(null)}
                disabled={processingOrderId === orderToCancel.id}
              >
                Voltar
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleConfirmCancelOrder}
                disabled={processingOrderId === orderToCancel.id}
              >
                {processingOrderId === orderToCancel.id ? 'Cancelando...' : 'Confirmar cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
