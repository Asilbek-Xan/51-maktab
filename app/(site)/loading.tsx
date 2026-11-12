export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-10 sm:px-6" role="status" aria-label="Yuklanmoqda">
      <div className="h-64 rounded-4xl bg-slate-200" />
      <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-3xl bg-slate-200" />)}</div>
    </div>
  );
}
