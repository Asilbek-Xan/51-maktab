const items = ['Bilim', 'Tarbiya', 'Fan olimpiadalari', 'To‘garaklar', 'Sport', 'San’at', 'Ota-onalar bilan hamkorlik'];

export default function Marquee() {
  const row = items.map((t) => (
    <span key={t} className="flex items-center gap-8 whitespace-nowrap">
      <span className="text-[15px] font-bold text-ink/70">{t}</span>
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
    </span>
  ));
  return (
    <div className="overflow-hidden py-5" aria-hidden="true">
      <div className="animate-marquee flex w-max gap-8"><div className="flex gap-8">{row}</div><div className="flex gap-8">{row}</div></div>
    </div>
  );
}
