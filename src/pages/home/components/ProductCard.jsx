import { formatCurrency } from '../../../utils/format';

export default function ProductCard({ product, quantity, onIncrement, onDecrement, disableIncrement, disableDecrement }) {
  const category = product.category || 'Produto';
  const description = product.description || '';

  return (
    <article className="card flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{category}</span>
          <h3 className="mt-3 text-xl font-bold text-slate-900">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preço</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
          <button
            type="button"
            onClick={onDecrement}
            disabled={disableDecrement}
            className="h-10 w-10 rounded-xl bg-white text-xl font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            -
          </button>
          <span className="min-w-8 text-center text-lg font-semibold text-slate-900">{quantity}</span>
          <button
            type="button"
            onClick={onIncrement}
            disabled={disableIncrement}
            className="h-10 w-10 rounded-xl bg-brand-600 text-xl font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
