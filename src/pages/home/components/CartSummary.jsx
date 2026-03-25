import { formatCurrency } from '../../../utils/format';
import EmptyState from './EmptyState';

export default function CartSummary({ items, total, actionLabel = 'Confirmar Pedido', disabled, onAction }) {
  if (!items.length) {
    return <EmptyState title="Carrinho vazio" description="Selecione produtos do cardápio para montar um novo pedido." compact />;
  }

  return (
    <div className="card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Resumo</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Seu pedido</h3>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{items.length} itens</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500">Qtd. {item.quantity}</p>
            </div>
            <p className="font-semibold text-slate-700">{formatCurrency(item.subtotal)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Total</span>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        type="button"
        className={`btn-primary mt-6 flex w-full ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        disabled={disabled}
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}
