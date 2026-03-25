import { Link } from 'react-router-dom';
import EmptyState from '../home/components/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { useOrderStore } from '../../store/orderStore';
import { getOrderStatusLabel } from '../../utils/orderStatus';

export default function SuccessPage() {
  const lastOrder = useOrderStore((state) => state.lastOrder);

  if (!lastOrder) {
    return <EmptyState title="Nenhum pedido recente" description="Faca um novo pedido para visualizar a confirmacao nesta pagina." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-brand-600 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Pedido confirmado</p>
          <h1 className="mt-3 text-4xl font-bold">Tudo certo! Seu pedido foi recebido.</h1>
          <p className="mt-3 text-sm text-emerald-50">Acompanhe o andamento do pedido no seu historico.</p>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Codigo</p>
              <p className="mt-2 font-bold text-slate-900">{lastOrder.id}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Data</p>
              <p className="mt-2 font-bold text-slate-900">{formatDateTime(lastOrder.createdAt)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-2 font-bold text-slate-900">{getOrderStatusLabel(lastOrder.status)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
              <p className="mt-2 font-bold text-slate-900">{formatCurrency(lastOrder.total)}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {lastOrder.items.map((item) => (
              <div
                key={`${lastOrder.id}-${item.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 text-sm"
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/orders" className="btn-primary">
          Ver meus pedidos
        </Link>
        <Link to="/" className="btn-secondary">
          Voltar ao cardapio
        </Link>
      </div>
    </div>
  );
}
