import { formatCurrency } from '../../../utils/format';

export default function CartItemCard({ item, footer }) {
  return (
    <article className="card p-5">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">{item.id}</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{item.name}</h3>
        </div>
        <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Qtd. {item.quantity}</span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Preco unitario</span>
          <span>{formatCurrency(item.price)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-800">{formatCurrency(item.subtotal)}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          Estoque <span className="font-bold text-slate-900">{item.amount}</span>
        </p>
        {footer}
      </div>
    </article>
  );
}
