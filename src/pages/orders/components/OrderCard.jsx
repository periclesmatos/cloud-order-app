import { formatCurrency, formatDateTime } from '../../../utils/format';
import { getOrderStatusLabel } from '../../../utils/orderStatus';

const STATUS_STYLES = {
  CREATED: 'bg-blue-50 text-blue-700',
  SENT: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELED: 'bg-rose-50 text-rose-700',
};

export default function OrderCard({ order, footer }) {
  const statusClass = STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-700';

  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">{order.id}</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{formatDateTime(order.createdAt)}</h3>
        </div>
        <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusClass}`}>
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.id}`} className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-medium text-slate-500">Total </span>
          <span className="font-bold text-slate-900">{formatCurrency(order.total)}</span>
        </p>
        {footer}
      </div>
    </article>
  );
}
