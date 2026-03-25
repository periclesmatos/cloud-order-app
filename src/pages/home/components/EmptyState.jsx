export default function EmptyState({ title, description, compact = false }) {
  return (
    <div className={`card flex flex-col items-center justify-center text-center ${compact ? 'p-6' : 'p-10'}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">📦</div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}